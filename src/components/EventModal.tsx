"use client"

import type React from "react"
import { useState, useEffect, useRef, type FormEvent } from "react"
import { X } from "lucide-react"
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const canEditEvent = () => {
    if (isCreating) return true
    if (!event) return false
    return event.created_by === currentUserId || isAdmin
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
        const { data, error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", event.id)
          .select("*, creator:created_by(*), approver:approved_by(*), event_participants(*)")
          .single()

        if (error) throw error
        onSave(data)
      } else {
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{isCreating ? "Create New Event" : "Edit Event"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

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
                disabled={!canEditEvent()}
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
                disabled={!canEditEvent()}
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
                  disabled={!canEditEvent()}
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time (IST) <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  required
                  className="input"
                  value={formData.time}
                  onChange={handleChange}
                  disabled={!canEditEvent()}
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
                  disabled={!canEditEvent()}
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time (IST) <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  required
                  className="input"
                  value={formData.endTime}
                  onChange={handleChange}
                  disabled={!canEditEvent()}
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
                disabled={!canEditEvent()}
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
                disabled={!canEditEvent()}
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
                  disabled={!canEditEvent()}
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
                  disabled={!canEditEvent()}
                />
              </div>
            )}

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}
          </div>

          {canEditEvent() && (
            <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : isCreating ? "Create Event" : "Update Event"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default EventModal
