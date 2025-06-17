"use client"

import { useState, useEffect } from "react"
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Calendar } from "lucide-react"
import { useSupabase } from "../contexts/SupabaseContext"
import { useAuth } from "../contexts/AuthContext"
import type { Event } from "../types"
import EventModal from "../components/EventModal"
import { formatToIST, formatDateToIST, getCurrentIST, isSameDayIST } from "../utils/timezone"
import { useSearchParams } from "react-router-dom"

const CalendarPage = () => {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(getCurrentIST())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [joiningEvents, setJoiningEvents] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const start = startOfMonth(currentMonth)
  const end = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start, end })

  // First day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = getDay(start)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const startStr = startOfMonth(currentMonth).toISOString()
        const endStr = endOfMonth(currentMonth).toISOString()

        const { data, error } = await supabase
          .from("events")
          .select("*, creator:created_by(*), event_participants(*)")
          .gte("start_time", startStr)
          .lte("start_time", endStr)

        if (error) throw error

        setEvents(data || [])
      } catch (error) {
        console.error("Error fetching events:", error)
        setError("Failed to load events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [currentMonth, supabase])

  useEffect(() => {
    const editEventId = searchParams.get("edit")
    if (editEventId && events.length > 0) {
      const eventToEdit = events.find((e) => e.id === editEventId)
      if (eventToEdit) {
        setSelectedEvent(eventToEdit)
        setIsCreating(false)
        setIsModalOpen(true)
        setSearchParams({})
      }
    }
  }, [searchParams, events, setSearchParams])

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      try {
        if (!event.start_time) return false
        // Convert UTC event time to IST for comparison
        const eventDate = new Date(event.start_time)
        if (isNaN(eventDate.getTime())) return false
        return isSameDayIST(eventDate, day)
      } catch (error) {
        console.error("Error filtering events for day:", error)
        return false
      }
    })
  }

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const openCreateModal = () => {
    setSelectedEvent(null)
    setIsCreating(true)
    setIsModalOpen(true)
  }

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event)
    setIsCreating(false)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
  }

  const handleEventSaved = async (savedEvent: Event) => {
    if (selectedEvent) {
      setEvents(events.map((event) => (event.id === savedEvent.id ? savedEvent : event)))
    } else {
      setEvents([...events, savedEvent])
      
      if (savedEvent.is_open && savedEvent.created_by === user?.id) {
        try {
          await supabase.from("event_participants").insert({
            event_id: savedEvent.id,
            user_id: user.id,
            role: "creator",
          })
          
          const currentMonthEvents = await supabase
            .from("events")
            .select("*, creator:created_by(*), event_participants(*)")
            .gte("start_time", startOfMonth(currentMonth).toISOString())
            .lte("start_time", endOfMonth(currentMonth).toISOString())

          if (currentMonthEvents.data) {
            setEvents(currentMonthEvents.data)
          }
        } catch (error) {
          console.error("Error auto-joining creator to event:", error)
        }
      }
    }
    setIsModalOpen(false)
    setSelectedEvent(null)
  }

  const handleJoinEvent = async (eventId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation() // Prevent event details modal from opening
    }
    
    if (!user?.id || joiningEvents.has(eventId)) return

    setJoiningEvents(prev => new Set(prev).add(eventId))
    setError(null)

    try {
      // First check if user is already joined
      const { data: existingParticipant, error: checkError } = await supabase
        .from("event_participants")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // "not found" error
        throw checkError
      }

      if (existingParticipant) {
        return
      }

      // Insert new participant
      const { data: insertData, error: insertError } = await supabase
        .from("event_participants")
        .insert({
          event_id: eventId,
          user_id: user.id,
          role: "participant",
        })
        .select()

      if (insertError) {
        throw insertError
      }

      // Refresh events to show updated participant count
      const currentMonthEvents = await supabase
        .from("events")
        .select("*, creator:created_by(*), event_participants(*)")
        .gte("start_time", startOfMonth(currentMonth).toISOString())
        .lte("start_time", endOfMonth(currentMonth).toISOString())

      if (currentMonthEvents.error) {
        throw currentMonthEvents.error
      }

      if (currentMonthEvents.data) {
        setEvents(currentMonthEvents.data)
      }
    } catch (error: any) {
      console.error("Error joining event:", error)
      setError(`Failed to join event: ${error.message || 'Unknown error'}`)
    } finally {
      setJoiningEvents(prev => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
    }
  }

  const handleLeaveEvent = async (eventId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    
    if (!user?.id || joiningEvents.has(eventId)) return

    setJoiningEvents(prev => new Set(prev).add(eventId))
    setError(null)

    try {
      const { error } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id)

      if (error) {
        throw error
      }

      const currentMonthEvents = await supabase
        .from("events")
        .select("*, creator:created_by(*), event_participants(*)")
        .gte("start_time", startOfMonth(currentMonth).toISOString())
        .lte("start_time", endOfMonth(currentMonth).toISOString())

      if (currentMonthEvents.error) {
        throw currentMonthEvents.error
      }

      if (currentMonthEvents.data) {
        setEvents(currentMonthEvents.data)
      }
    } catch (error: any) {
      console.error("Error leaving event:", error)
      setError(`Failed to leave event: ${error.message || 'Unknown error'}`)
    } finally {
      setJoiningEvents(prev => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
    }
  }

  const isUserJoined = (event: Event) => {
    return event.event_participants?.some((p: any) => p.user_id === user?.id) || false
  }

  const canEditEvent = (event: Event) => {
    return event.created_by === user?.id || user?.is_admin
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">View and manage upcoming shoots and screenings</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button onClick={openCreateModal} className="btn btn-primary flex items-center">
            <Plus className="mr-1 h-4 w-4" />
            Create Event
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-lg">{formatDateToIST(currentMonth, "MMMM yyyy")}</h2>
          <div className="flex space-x-2">
            <button onClick={previousMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="grid grid-cols-7 gap-px">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 text-center text-sm font-semibold text-gray-700 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-gray-50 h-24 sm:h-32"></div>
            ))}

            {/* Calendar days */}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day)
              return (
                <div key={day.toString()} className="bg-white h-24 sm:h-32 p-1 overflow-hidden">
                  <div className="font-medium text-sm p-1">{formatDateToIST(day, "d")}</div>

                  <div className="overflow-y-auto max-h-20 sm:max-h-24">
                    {dayEvents.map((event) => (
                      <div key={event.id} className="flex flex-col mb-1">
                        <button
                          onClick={() => openEventDetails(event)}
                          className={`w-full text-left text-xs px-1 py-1 rounded truncate ${
                            event.event_type === "shoot"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                              : event.event_type === "screening"
                                ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          } ${!event.is_open ? "opacity-75" : ""} transition-colors`}
                          title={`${event.title} ${!event.is_open ? "(Private)" : ""}`}
                        >
                          {formatToIST(event.start_time, "h:mm a")} - {event.title}
                          {!event.is_open && <span className="ml-1">🔒</span>}
                        </button>
                        
                        {/* Join/Leave buttons with proper event handling */}
                        {event.id && event.is_open && (
                          <div className="flex gap-1 mt-0.5">
                            {!isUserJoined(event) ? (
                              <button
                                onClick={(e) => handleJoinEvent(event.id, e)}
                                disabled={joiningEvents.has(event.id)}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-[0.6rem] rounded px-1 py-0.5 transition-colors font-medium"
                                title="Join this event"
                              >
                                {joiningEvents.has(event.id) ? "..." : "Join"}
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleLeaveEvent(event.id, e)}
                                disabled={joiningEvents.has(event.id)}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-[0.6rem] rounded px-1 py-0.5 transition-colors font-medium"
                                title="Leave this event"
                              >
                                {joiningEvents.has(event.id) ? "..." : "Leave"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span className="text-xs text-gray-600">Shoot</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
              <span className="text-xs text-gray-600">Screening</span>
            </div>
            <div className="flex items-center ml-auto">
              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-xs text-gray-500">
                {loading ? "Loading events..." : `${events.length} events this month`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleEventSaved}
          isCreating={isCreating}
          currentUserId={user?.id || ""}
          isAdmin={user?.is_admin || false}
          onJoinEvent={handleJoinEvent}
          onLeaveEvent={handleLeaveEvent}
          isUserJoined={selectedEvent ? isUserJoined(selectedEvent) : false}
          canEditEvent={selectedEvent ? canEditEvent(selectedEvent) : false}
        />
      )}
    </div>
  )
}

export default CalendarPage
