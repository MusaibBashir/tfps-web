"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, AlertTriangle } from "lucide-react"
import { useSupabase } from "../contexts/SupabaseContext"
import type { Equipment, User, Event } from "../types"
import { format } from "date-fns"

interface RequestEquipmentModalProps {
  equipment: Equipment
  isOpen: boolean
  onClose: () => void
  currentUser: User
}

const RequestEquipmentModal: React.FC<RequestEquipmentModalProps> = ({ equipment, isOpen, onClose, currentUser }) => {
  const { supabase } = useSupabase()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingRequests, setExistingRequests] = useState<any[]>([])
  const [currentUserWithEquipment, setCurrentUserWithEquipment] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return

      try {
        const today = new Date().toISOString()

        // Fetch upcoming events created by the current user
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("created_by", currentUser.id)
          .eq("is_approved", true) // Only approved events
          .gte("start_time", today)
          .order("start_time")

        if (eventsError) throw eventsError
        setEvents(eventsData || [])

        // Check for existing pending requests for this equipment
        const { data: requestsData, error: requestsError } = await supabase
          .from("equipment_requests")
          .select(`
            *,
            requester:users!equipment_requests_requester_id_fkey(*),
            events(*)
          `)
          .eq("equipment_id", equipment.id)
          .eq("status", "pending")

        if (requestsError) throw requestsError
        setExistingRequests(requestsData || [])

        // Check if equipment is currently in use and get current user
        if (equipment.status === "in_use") {
          const { data: logData } = await supabase
            .from("equipment_logs")
            .select("*, user:user_id(*)")
            .eq("equipment_id", equipment.id)
            .is("return_time", null)
            .order("checkout_time", { ascending: false })
            .limit(1)
            .single()

          if (logData?.user) {
            setCurrentUserWithEquipment(logData.user)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please try again.")
      }
    }

    fetchData()
  }, [supabase, currentUser.id, isOpen, equipment.id, equipment.status])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedEvent("")
      setNotes("")
      setError(null)
      setSuccess(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedEvent) {
      setError("Please select an event. Equipment requests must be associated with an approved event.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Submitting request with data:", {
        equipment_id: equipment.id,
        event_id: selectedEvent,
        requester_id: currentUser.id,
        status: "pending",
        notes: notes || null,
      })

      // Create equipment request
      const { data, error } = await supabase
        .from("equipment_requests")
        .insert({
          equipment_id: equipment.id,
          event_id: selectedEvent,
          requester_id: currentUser.id,
          status: "pending",
          notes: notes || null,
        })
        .select("*")
        .single()

      if (error) {
        console.error("Supabase error:", error)
        throw error
      }

      console.log("Request created successfully:", data)
      setSuccess(true)

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error: any) {
      console.error("Error requesting equipment:", error)
      setError(error.message || "Failed to submit request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Request Equipment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Request Submitted!</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your request for {equipment.name} has been submitted successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  You are requesting: <span className="font-medium text-gray-900">{equipment.name}</span>
                </p>
              </div>

              {/* Show current user if equipment is in use */}
              {equipment.status === "in_use" && currentUserWithEquipment && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Equipment Currently In Use</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          This equipment is currently with{" "}
                          <span className="font-medium">{currentUserWithEquipment.name}</span>. Your request will be
                          processed when the equipment is returned.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show existing pending requests */}
              {existingRequests.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Existing Requests</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>There are {existingRequests.length} pending request(s) for this equipment:</p>
                        <ul className="mt-1 list-disc list-inside">
                          {existingRequests.map((req) => (
                            <li key={req.id}>
                              {req.requester?.name} for {req.events?.title || "general use"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="event" className="block text-sm font-medium text-gray-700">
                  Select Event <span className="text-red-500">*</span>
                </label>
                {events.length > 0 ? (
                  <select
                    id="event"
                    className="select mt-1"
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    required
                  >
                    <option value="">Select an event...</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} ({format(new Date(event.start_time), "MMM d, yyyy")})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    You don't have any upcoming approved events. You must have an approved event to request equipment.
                    Please create an event first.
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="input mt-1"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements or details about your request"
                />
              </div>

              {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}
            </div>

            <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
              <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading || events.length === 0}>
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default RequestEquipmentModal
