"use client"

import type React from "react"
import { useState, useEffect, useRef, type FormEvent } from "react"
import { X, UserPlus, Users } from "lucide-react"
import { useSupabase } from "../contexts/SupabaseContext"
import type { Event } from "../types"
import { convertLocalToUTC, convertUTCToLocal } from "../utils/timezone"

interface EventModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onSave: (savedEvent: Event) => void
  isCreating: boolean
  currentUserId: string
  isAdmin: boolean
  onJoinEvent?: (eventId: string) => void
  onLeaveEvent?: (eventId: string) => void
  isUserJoined?: boolean
  canEditEvent?: boolean
}

const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  isCreating,
  currentUserId,
  isAdmin,
  onJoinEvent,
  onLeaveEvent,
  isUserJoined = false,
  canEditEvent = false,
}) => {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joiningEvent, setJoiningEvent] = useState(false)
  const [participants, setParticipants] = useState<any[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    event_type: "shoot" as "shoot" | "screening" | "other",
    date: "",
    time: "",
    endDate: "",
    endTime: "",
    is_open: true,
    max_participants: "",
  })

  // Handle clicking outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscapeKey)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isOpen, onClose])

  // Fetch participants when viewing an event
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!event?.id || isCreating || canEditEvent) return

      setLoadingParticipants(true)
      try {
        const { data, error } = await supabase
          .from("event_participants")
          .select(`
            *,
            user:user_id (
              id,
              name,
              email
            )
          `)
          .eq("event_id", event.id)
          .order("created_at", { ascending: true })

        if (error) throw error
        setParticipants(data || [])
      } catch (error) {
        console.error("Error fetching participants:", error)
      } finally {
        setLoadingParticipants(false)
      }
    }

    if (isOpen) {
      fetchParticipants()
    }
  }, [event?.id, isOpen, isCreating, canEditEvent, supabase])

  useEffect(() => {
    if (event) {
      try {
        const { date, time } = event.start_time ? convertUTCToLocal(event.start_time) : { date: "", time: "" }
        const { date: endDate, time: endTime } = event.end_time
          ? convertUTCToLocal(event.end_time)
          : { date: "", time: "" }

        setFormData({
          title: event.title || "",
          description: event.description || "",
          location: event.location || "",
          event_type: event.event_type || "shoot",
          date: date,
          time: time,
          endDate: endDate,
          endTime: endTime,
          is_open: event.is_open ?? true,
          max_participants: event.max_participants?.toString() || "",
        })
      } catch (error) {
        console.error("Error setting event data:", error)
        // Set default values on error
        const now = new Date()
        const defaultDate = now.toISOString().split("T")[0]
        const defaultTime = now.toTimeString().slice(0, 5)

        setFormData({
          title: event.title || "",
          description: event.description || "",
          location: event.location || "",
          event_type: event.event_type || "shoot",
          date: defaultDate,
          time: defaultTime,
          endDate: defaultDate,
          endTime: defaultTime,
          is_open: event.is_open ?? true,
          max_participants: event.max_participants?.toString() || "",
        })
      }
    } else {
      // Set default values for new event
      const now = new Date()
      const defaultDate = now.toISOString().split("T")[0]
      const defaultTime = now.toTimeString().slice(0, 5)

      setFormData({
        title: "",
        description: "",
        location: "",
        event_type: "shoot",
        date: defaultDate,
        time: defaultTime,
        endDate: defaultDate,
        endTime: defaultTime,
        is_open: true,
        max_participants: "",
      })
    }
    setError(null)
    setJoiningEvent(false)
    setParticipants([])
  }, [event, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.title.trim()) {
        setError("Event title is required")
        return
      }

      if (!formData.date || !formData.time) {
        setError("Start date and time are required")
        return
      }

      if (!formData.endDate || !formData.endTime) {
        setError("End date and time are required")
        return
      }

      const startTime = convertLocalToUTC(formData.date, formData.time)
      const endTime = convertLocalToUTC(formData.endDate, formData.endTime)

      if (new Date(startTime) >= new Date(endTime)) {
        setError("End time must be after start time")
        return
      }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        location: formData.location.trim() || null,
        event_type: formData.event_type,
        start_time: startTime,
        end_time: endTime,
        created_by: currentUserId,
        is_approved: isAdmin, // Auto-approve if admin
        approved_by: isAdmin ? currentUserId : null,
        is_open: formData.is_open,
        max_participants: formData.max_participants ? Number.parseInt(formData.max_participants) : null,
      }

      if (event) {
        // Update existing event
        const { data, error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", event.id)
          .select("*, creator:created_by(*), approver:approved_by(*), event_participants(*)")
          .single()

        if (error) throw error
        onSave(data)
      } else {
        // Create new event
        const { data, error } = await supabase
          .from("events")
          .insert(eventData)
          .select("*, creator:created_by(*), approver:approved_by(*), event_participants(*)")
          .single()

        if (error) throw error
        onSave(data)
      }
    } catch (error: any) {
      console.error("Error saving event:", error)
      setError(error.message || "Failed to save event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinLeaveEvent = async (action: 'join' | 'leave') => {
    if (!event?.id || !onJoinEvent || !onLeaveEvent || joiningEvent) return

    setJoiningEvent(true)
    setError(null)

    try {
      if (action === 'join') {
        await onJoinEvent(event.id)
      } else {
        await onLeaveEvent(event.id)
      }
      
      // Refresh participants list after join/leave
      const { data } = await supabase
        .from("event_participants")
        .select(`
          *,
          user:user_id (
            id,
            name,
            email
          )
        `)
        .eq("event_id", event.id)
        .order("created_at", { ascending: true })

      if (data) {
        setParticipants(data)
      }
      
      // Close modal after successful join/leave
      onClose()
    } catch (error: any) {
      console.error(`Error ${action}ing event:`, error)
      setError(`Failed to ${action} event: ${error.message || 'Unknown error'}`)
    } finally {
      setJoiningEvent(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{isCreating ? "Create New Event" : "Event Details"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isCreating && !canEditEvent ? (
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{event?.title}</h3>
              <p className="text-sm text-gray-600 capitalize">{event?.event_type}</p>
            </div>

            {event?.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900">{event.description}</p>
              </div>
            )}

            {event?.location && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-sm text-gray-900">{event.location}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <p className="text-sm text-gray-900">
                {event?.start_time && event?.end_time && (
                  <>
                    {convertUTCToLocal(event.start_time).date} from {convertUTCToLocal(event.start_time).time} to{" "}
                    {convertUTCToLocal(event.end_time).time}
                  </>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
              <p className="text-sm text-gray-900">
                {event?.event_participants?.length || 0} participant
                {(event?.event_participants?.length || 0) !== 1 ? "s" : ""}
                {event?.max_participants && ` (max ${event.max_participants})`}
              </p>
            </div>

            {/* Participants List */}
            {event?.is_open && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Who's Joining
                </label>
                {loadingParticipants ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                ) : participants.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-primary-700">
                                {participant.user?.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900">{participant.user?.name || 'Unknown User'}</span>
                          </div>
                          {participant.role === 'creator' && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Creator
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                    No participants yet. Be the first to join!
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {event?.is_open && onJoinEvent && onLeaveEvent && (
              <div className="pt-4 border-t">
                {isUserJoined ? (
                  <button 
                    onClick={() => handleJoinLeaveEvent('leave')} 
                    disabled={joiningEvent}
                    className="w-full btn btn-secondary disabled:opacity-50"
                  >
                    {joiningEvent ? "Leaving..." : "Leave Event"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinLeaveEvent('join')}
                    disabled={joiningEvent}
                    className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UserPlus size={16} />
                    {joiningEvent ? "Joining..." : "Join Event"}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  id="event_type"
                  name="event_type"
                  className="select"
                  value={formData.event_type}
                  onChange={handleChange}
                >
                  <option value="shoot">Shoot</option>
                  <option value="screening">Screening</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    className="input"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    required
                    className="input"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    required
                    className="input"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    required
                    className="input"
                    value={formData.endTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="input"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter event location"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="input"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter event description"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_open"
                    name="is_open"
                    checked={formData.is_open}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_open" className="ml-2 block text-sm text-gray-700">
                    Open for participants to join
                  </label>
                </div>
              </div>

              {formData.is_open && (
                <div>
                  <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Participants (optional)
                  </label>
                  <input
                    type="number"
                    id="max_participants"
                    name="max_participants"
                    min="1"
                    className="input"
                    value={formData.max_participants}
                    onChange={handleChange}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              )}

              {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}
            </div>

            <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : isCreating ? "Create Event" : "Update Event"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default EventModal
