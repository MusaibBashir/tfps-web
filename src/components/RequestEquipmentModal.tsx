"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, AlertTriangle, Clock } from "lucide-react"
import { useSupabase } from "../contexts/SupabaseContext"
import type { Equipment, User, Event, TimeConflict } from "../types"
import { format } from "date-fns"
import { convertUTCToLocal } from "../utils/timezone"

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
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingRequests, setExistingRequests] = useState<any[]>([])
  const [currentUserWithEquipment, setCurrentUserWithEquipment] = useState<any>(null)
  const [timeConflicts, setTimeConflicts] = useState<TimeConflict[]>([])
  const [checkingConflicts, setCheckingConflicts] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return

      try {
        const today = new Date().toISOString()

        // Fetch upcoming events (both created by user and joined by user)
        const { data: userEvents, error: userEventsError } = await supabase
          .from("events")
          .select("*")
          .eq("created_by", currentUser.id)
          .gte("start_time", today)
          .order("start_time")

        if (userEventsError) throw userEventsError

        // Fetch events user has joined
        const { data: joinedEvents, error: joinedEventsError } = await supabase
          .from("event_participants")
          .select("events(*)")
          .eq("user_id", currentUser.id)
          .eq("role", "participant")

        if (joinedEventsError) throw joinedEventsError

        // Combine and deduplicate events
        const allEvents = [...(userEvents || []), ...(joinedEvents?.map((ep) => ep.events).filter(Boolean) || [])]

        const uniqueEvents = allEvents
          .filter((event, index, self) => index === self.findIndex((e) => e.id === event.id))
          .filter((event) => new Date(event.start_time) >= new Date(today))

        setEvents(uniqueEvents)

        // Check for existing pending requests for this equipment
        const { data: requestsData, error: requestsError } = await supabase
          .from("equipment_requests")
          .select(`
            *,
            requester:users!equipment_requests_requester_id_fkey(*),
            events(*),
            current_holder:users!equipment_requests_current_holder_id_fkey(*)
          `)
          .eq("equipment_id", equipment.id)
          .in("status", ["pending", "approved", "received"])

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
      setStartTime("")
      setEndTime("")
      setError(null)
      setSuccess(false)
      setTimeConflicts([])
    }
  }, [isOpen])

  // Auto-fill times when event is selected
  useEffect(() => {
    if (selectedEvent) {
      const event = events.find((e) => e.id === selectedEvent)
      if (event) {
        // Convert UTC times to IST for display in datetime-local inputs
        const { date: startDate, time: startTime } = convertUTCToLocal(event.start_time)
        const { date: endDate, time: endTime } = convertUTCToLocal(event.end_time)

        // Combine date and time for datetime-local input format
        setStartTime(`${startDate}T${startTime}`)
        setEndTime(`${endDate}T${endTime}`)
      }
    }
  }, [selectedEvent, events])

  // Check for time conflicts when times change
  useEffect(() => {
    const checkConflicts = async () => {
      if (!startTime || !endTime) {
        setTimeConflicts([])
        return
      }

      setCheckingConflicts(true)
      try {
        const { data, error } = await supabase.rpc("check_time_conflicts", {
          p_equipment_id: equipment.id,
          p_start_time: startTime,
          p_end_time: endTime,
        })

        if (error) throw error
        setTimeConflicts(data || [])
      } catch (error) {
        console.error("Error checking conflicts:", error)
      } finally {
        setCheckingConflicts(false)
      }
    }

    const timeoutId = setTimeout(checkConflicts, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [startTime, endTime, equipment.id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startTime || !endTime) {
      setError("Please specify start and end times for your request.")
      return
    }

    if (new Date(startTime) >= new Date(endTime)) {
      setError("End time must be after start time.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create equipment request with time information
      const { data, error } = await supabase
        .from("equipment_requests")
        .insert({
          equipment_id: equipment.id,
          event_id: selectedEvent || null,
          requester_id: currentUser.id,
          status: "pending",
          notes: notes || null,
          start_time: startTime,
          end_time: endTime,
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
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
                {equipment.ownership_type === "student" && equipment.owner_id && (
                  <p className="text-xs text-gray-500">Student-owned equipment</p>
                )}
                {equipment.ownership_type === "hall" && equipment.hall && (
                  <p className="text-xs text-gray-500">Hall equipment: {equipment.hall}</p>
                )}
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
                          forwarded to them for coordination.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="event" className="block text-sm font-medium text-gray-700">
                  Select Event (Optional)
                </label>
                {events.length > 0 ? (
                  <select
                    id="event"
                    className="select mt-1"
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                  >
                    <option value="">Select an event (optional)...</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} ({format(new Date(event.start_time), "MMM d, yyyy")})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
                    No upcoming events found. You can still request equipment for general use.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    className="input mt-1"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    className="input mt-1"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Time conflicts warning */}
              {checkingConflicts && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex">
                    <Clock className="h-5 w-5 text-blue-400 animate-spin" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">Checking for time conflicts...</p>
                    </div>
                  </div>
                </div>
              )}

              {timeConflicts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Time Conflicts Detected</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>Your requested time conflicts with:</p>
                        <ul className="mt-1 list-disc list-inside">
                          {timeConflicts.map((conflict) => (
                            <li key={conflict.conflicting_request_id}>
                              {conflict.requester_name}: {format(new Date(conflict.start_time), "MMM d, HH:mm")} -{" "}
                              {format(new Date(conflict.end_time), "HH:mm")}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs">
                          If your request is approved, conflicting requests will be automatically declined.
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
                        <p>There are {existingRequests.length} pending/active request(s) for this equipment:</p>
                        <ul className="mt-1 list-disc list-inside">
                          {existingRequests.map((req) => (
                            <li key={req.id}>
                              {req.requester?.name} for {req.events?.title || "general use"}
                              {req.start_time && req.end_time && (
                                <span className="text-xs">
                                  {" "}
                                  ({format(new Date(req.start_time), "MMM d, HH:mm")} -{" "}
                                  {format(new Date(req.end_time), "HH:mm")})
                                </span>
                              )}
                              {req.current_holder && ` (currently with ${req.current_holder.name})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
              <button type="submit" className="btn btn-primary" disabled={loading}>
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
