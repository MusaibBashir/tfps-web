"use client"

import type React from "react"
import { useState, useEffect, type FormEvent } from "react"
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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    event_type: "shoot" as "shoot" | "screening" | "other",
    date: "",
    time: "",
    endDate: "",
    endTime: "",
  })

  useEffect(() => {
    if (event) {
      const { date, time } = convertUTCToLocal(event.start_time)
      const { date: endDate, time: endTime } = convertUTCToLocal(event.end_time)

      setFormData({
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        event_type: event.event_type,
        date: date,
        time: time,
        endDate: endDate,
        endTime: endTime,
      })
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
      })
    }
    setError(null)
  }, [event, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
      }

      if (event) {
        // Update existing event
        const { data, error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", event.id)
          .select("*, creator:created_by(*), approver:approved_by(*)")
          .single()

        if (error) throw error
        onSave(data)
      } else {
        // Create new event
        const { data, error } = await supabase
          .from("events")
          .insert(eventData)
          .select("*, creator:created_by(*), approver:approved_by(*)")
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
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
      </div>
    </div>
  )
}

export default EventModal
