"use client"

import { useState, useEffect } from "react"
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Plus, Calendar } from "lucide-react"
import { useSupabase } from "../contexts/SupabaseContext"
import { useAuth } from "../contexts/AuthContext"
import type { Event } from "../types"
import EventModal from "../components/EventModal"
import { formatToIST, formatDateToIST, getCurrentIST } from "../utils/timezone"
import { utcToZonedTime } from "date-fns-tz"

const CalendarPage = () => {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(getCurrentIST())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

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
          .select("*, creator:created_by(*), approver:approved_by(*)")
          .gte("start_time", startStr)
          .lte("start_time", endStr)

        if (error) throw error

        setEvents(data || [])
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [currentMonth, supabase])

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      // Convert UTC event time to IST for comparison
      const eventDate = utcToZonedTime(new Date(event.start_time), "Asia/Kolkata")
      return isSameDay(eventDate, day)
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

  const handleEventSaved = (savedEvent: Event) => {
    if (selectedEvent) {
      // Update existing event in the list
      setEvents(events.map((event) => (event.id === savedEvent.id ? savedEvent : event)))
    } else {
      // Add new event to the list
      setEvents([...events, savedEvent])
    }
    setIsModalOpen(false)
    setSelectedEvent(null)
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
            {/* Empty cells for days before the first day of month */}
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
                      <button
                        key={event.id}
                        onClick={() => openEventDetails(event)}
                        className={`w-full text-left text-xs mb-1 px-1 py-1 rounded truncate ${
                          event.event_type === "shoot" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {formatToIST(event.start_time, "h:mm a")} - {event.title}
                      </button>
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
        />
      )}
    </div>
  )
}

export default CalendarPage
