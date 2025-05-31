"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Package, Users, UserPlus } from "lucide-react"
import { useSupabase } from "../contexts/SupabaseContext"
import type { Event, Equipment, EventParticipant } from "../types"
import { format, parseISO } from "date-fns"

interface EventModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: Event) => void
  isCreating: boolean
  currentUserId: string
  isAdmin: boolean
}

// Helper function to convert IST datetime string to local date/time inputs
const parseISTDateTime = (isoString: string) => {
  // Parse the ISO string and treat it as IST
  const date = new Date(isoString)
  
  // Create a new date object that represents the IST time as local time
  // This prevents timezone conversion
  const istDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))
  
  return {
    date: format(istDate, "yyyy-MM-dd"),
    time: format(istDate, "HH:mm")
  }
}

// Helper function to create IST datetime string from local date/time inputs
const createISTDateTime = (dateStr: string, timeStr: string) => {
  // Create datetime string in IST format
  // This treats the input as IST time directly
  return `${dateStr}T${timeStr}:00+05:30`
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  isCreating,
  currentUserId,
  isAdmin,
}) => {
  const { supabase } = useSupabase()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [eventType, setEventType] = useState<"shoot" | "screening" | "other">("shoot")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isEventOpen, setIsEventOpen] = useState(false)
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([])
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([])
  const [equipmentSearch, setEquipmentSearch] = useState("")
  const [participants, setParticipants] = useState<EventParticipant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUserParticipant, setIsUserParticipant] = useState(false)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || "")
      setLocation(event.location || "")
      setEventType(event.event_type)
      setIsEventOpen(event.is_open || false)
      setMaxParticipants(event.max_participants)

      // Parse IST datetime strings
      const startDateTime = parseISTDateTime(event.start_time)
      const endDateTime = parseISTDateTime(event.end_time)

      setStartDate(startDateTime.date)
      setStartTime(startDateTime.time)
      setEndDate(endDateTime.date)
      setEndTime(endDateTime.time)

      // Fetch participants for existing event
      fetchParticipants(event.id)
    } else {
      // Default values for new event
      const now = new Date()
      const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // Add 2 hours
      
      setTitle("")
      setDescription("")
      setLocation("")
      setEventType("shoot")
      setIsEventOpen(false)
      setMaxParticipants(null)
      setStartDate(format(now, "yyyy-MM-dd"))
      setStartTime(format(now, "HH:mm"))
      setEndDate(format(now, "yyyy-MM-dd"))
      setEndTime(format(endTime, "HH:mm"))
      setParticipants([])
    }
  }, [event])

  const fetchParticipants = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from("event_participants")
        .select("*, user:users(*)")
        .eq("event_id", eventId)
        .order("joined_at")

      if (error) throw error
      setParticipants(data || [])
      setIsUserParticipant(data?.some((p) => p.user_id === currentUserId) || false)
    } catch (error) {
      console.error("Error fetching participants:", error)
    }
  }

  useEffect(() => {
    // Fetch available equipment for selection
    const fetchAvailableEquipment = async () => {
      try {
        const { data, error } = await supabase.from("equipment").select("*").eq("status", "available").order("name")

        if (error) throw error
        setAvailableEquipment(data || [])
        setFilteredEquipment(data || [])
      } catch (error) {
        console.error("Error fetching equipment:", error)
      }
    }

    if (isCreating) {
      fetchAvailableEquipment()
    }
  }, [supabase, isCreating])

  useEffect(() => {
    // Filter equipment based on search query
    const filtered = availableEquipment.filter(
      (equipment) =>
        equipment.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        equipment.type.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
        equipment.subtype?.toLowerCase().includes(equipmentSearch.toLowerCase()),
    )
    setFilteredEquipment(filtered)
  }, [equipmentSearch, availableEquipment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create IST datetime strings
      const startDateTime = createISTDateTime(startDate, startTime)
      const endDateTime = createISTDateTime(endDate, endTime)

      const eventData = {
        title,
        description,
        location,
        event_type: eventType,
        start_time: startDateTime,
        end_time: endDateTime,
        created_by: currentUserId,
        is_approved: true, // Events are automatically approved
        approved_by: currentUserId,
        is_open: isEventOpen,
        max_participants: maxParticipants,
      }

      if (isCreating) {
        // Create new event
        const { data, error } = await supabase.from("events").insert(eventData).select("*").single()

        if (error) throw error

        // Add creator as participant
        if (data) {
          await supabase.from("event_participants").insert({
            event_id: data.id,
            user_id: currentUserId,
            role: "creator",
          })
        }

        // If equipment was selected, create equipment requests
        if (data && selectedEquipment.length > 0) {
          const equipmentRequests = selectedEquipment.map((equipmentId) => ({
            equipment_id: equipmentId,
            event_id: data.id,
            requester_id: currentUserId,
            status: "pending",
            notes: "Requested during event creation",
          }))

          const { error: requestError } = await supabase.from("equipment_requests").insert(equipmentRequests)

          if (requestError) {
            console.error("Error creating equipment requests:", requestError)
            // Don't fail the event creation if requests fail
          }
        }

        if (data) onSave(data)
      } else if (event) {
        // Update existing event
        const { data, error } = await supabase.from("events").update(eventData).eq("id", event.id).select("*").single()

        if (error) throw error
        if (data) onSave(data)
      }
    } catch (error) {
      console.error("Error saving event:", error)
      setError("Failed to save event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinEvent = async () => {
    if (!event) return

    setLoading(true)
    try {
      const { error } = await supabase.from("event_participants").insert({
        event_id: event.id,
        user_id: currentUserId,
        role: "participant",
      })

      if (error) throw error

      // Refresh participants
      await fetchParticipants(event.id)
    } catch (error) {
      console.error("Error joining event:", error)
      setError("Failed to join event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveEvent = async () => {
    if (!event) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", event.id)
        .eq("user_id", currentUserId)

      if (error) throw error

      // Refresh participants
      await fetchParticipants(event.id)
    } catch (error) {
      console.error("Error leaving event:", error)
      setError("Failed to leave event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const canEdit = isCreating || event?.created_by === currentUserId || isAdmin
  const canJoin = !isCreating && event?.is_open && !isUserParticipant && event?.created_by !== currentUserId
  const canLeave = !isCreating && isUserParticipant && event?.created_by !== currentUserId
  const isAtCapacity = event?.max_participants && participants.length >= event.max_participants

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{isCreating ? "Create Event" : "Event Details"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title
              </label>
              <input
                type="text"
                id="title"
                className="input mt-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={!canEdit}
              />
            </div>

            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
                Event Type
              </label>
              <select
                id="eventType"
                className="select mt-1"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                disabled={!canEdit}
              >
                <option value="shoot">Shoot</option>
                <option value="screening">Screening</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="input mt-1"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  disabled={!canEdit}
                />
              </div>
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time (IST)
                </label>
                <input
                  type="time"
                  id="startTime"
                  className="input mt-1"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="input mt-1"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  disabled={!canEdit}
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time (IST)
                </label>
                <input
                  type="time"
                  id="endTime"
                  className="input mt-1"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                className="input mt-1"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={!canEdit}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="input mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEdit}
              />
            </div>

            {/* Event Settings */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Event Settings</h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isOpen"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={isEventOpen}
                    onChange={(e) => setIsEventOpen(e.target.checked)}
                    disabled={!canEdit}
                  />
                  <label htmlFor="isOpen" className="ml-2 text-sm text-gray-700">
                    Allow others to join this event
                  </label>
                </div>

                {isEventOpen && (
                  <div>
                    <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                      Maximum Participants (optional)
                    </label>
                    <input
                      type="number"
                      id="maxParticipants"
                      className="input mt-1"
                      value={maxParticipants || ""}
                      onChange={(e) => setMaxParticipants(e.target.value ? Number.parseInt(e.target.value) : null)}
                      min="1"
                      disabled={!canEdit}
                      placeholder="No limit"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Participants */}
            {!isCreating && participants.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Participants ({participants.length}
                  {event?.max_participants ? `/${event.max_participants}` : ""})
                </h3>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-900">{participant.user?.name}</span>
                        {participant.role === "creator" && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Creator</span>
                        )}
                      </div>
                      <span className="text-gray-500">{format(parseISO(participant.joined_at), "MMM d")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment selection - only show when creating new event */}
            {isCreating && availableEquipment.length > 0 && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Request Equipment (Optional)</label>

                {/* Search input */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Search equipment..."
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    value={equipmentSearch}
                    onChange={(e) => setEquipmentSearch(e.target.value)}
                  />
                  <Package className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>

                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
                  {filteredEquipment.length > 0 ? (
                    filteredEquipment.map((equipment) => (
                      <label key={equipment.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={selectedEquipment.includes(equipment.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEquipment([...selectedEquipment, equipment.id])
                            } else {
                              setSelectedEquipment(selectedEquipment.filter((id) => id !== equipment.id))
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700">
                          {equipment.name} ({equipment.type}
                          {equipment.subtype ? `, ${equipment.subtype}` : ""})
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">No equipment found matching your search.</p>
                  )}
                </div>
                {selectedEquipment.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedEquipment.length} item(s) selected. Equipment requests will be created automatically.
                  </p>
                )}
              </div>
            )}

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}
          </div>

          <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
            {/* Join/Leave Event Buttons */}
            {canJoin && !isAtCapacity && (
              <button
                type="button"
                onClick={handleJoinEvent}
                className="btn btn-secondary flex items-center"
                disabled={loading}
              >
                <UserPlus className="mr-1 h-4 w-4" />
                Join Event
              </button>
            )}

            {canJoin && isAtCapacity && (
              <span className="text-sm text-gray-500 flex items-center">
                <Users className="mr-1 h-4 w-4" />
                Event is full
              </span>
            )}

            {canLeave && (
              <button type="button" onClick={handleLeaveEvent} className="btn btn-outline" disabled={loading}>
                Leave Event
              </button>
            )}

            {/* Edit/Save Buttons */}
            {canEdit && (
              <>
                <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : isCreating ? "Create Event" : "Update Event"}
                </button>
              </>
            )}

            {!canEdit && !canJoin && !canLeave && (
              <button type="button" onClick={onClose} className="btn btn-outline">
                Close
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventModal
