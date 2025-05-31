"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ClipboardList, Search, CheckCircle, XCircle, Package, UserPlus, Send, ArrowRightLeft } from "lucide-react"
import { useSupabase } from "../contexts/SupabaseContext"
import { useAuth } from "../contexts/AuthContext"
import type { EquipmentRequest } from "../types"
import { format, parseISO } from "date-fns"

const RequestsPage = () => {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [requests, setRequests] = useState<EquipmentRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<EquipmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [forwardingId, setForwardingId] = useState<string | null>(null)
  const [selectedForwardUser, setSelectedForwardUser] = useState<string>("")
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [returningId, setReturningId] = useState<string | null>(null)
  const [returnToUser, setReturnToUser] = useState<string>("")
  const [returnCondition, setReturnCondition] = useState<"perfect" | "damaged">("perfect")
  const [damageNotes, setDamageNotes] = useState("")

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Get ALL requests using explicit relationship names to avoid ambiguity
        const { data: allRequestsData, error: allRequestsError } = await supabase
          .from("equipment_requests")
          .select(`
            *,
            equipment(*),
            requester:users!equipment_requests_requester_id_fkey(*),
            approver:users!equipment_requests_approved_by_fkey(*),
            forwarded_user:users!equipment_requests_forwarded_to_fkey(*),
            current_holder:users!equipment_requests_current_holder_id_fkey(*)
          `)
          .order("created_at", { ascending: false })

        if (allRequestsError) {
          console.error("Error fetching all requests:", allRequestsError)
          throw allRequestsError
        }

        // Fetch events separately for requests that have event_id
        let requestsWithEvents = allRequestsData || []
        if (requestsWithEvents.length > 0) {
          const eventIds = requestsWithEvents.filter((req) => req.event_id).map((req) => req.event_id)

          if (eventIds.length > 0) {
            const { data: eventsForRequests } = await supabase.from("events").select("*").in("id", eventIds)

            // Manually attach events to requests
            requestsWithEvents = requestsWithEvents.map((req) => ({
              ...req,
              events: req.event_id ? eventsForRequests?.find((e) => e.id === req.event_id) : null,
            }))
          }
        }

        // Filter requests this user should see
        let userRequests: any[] = []

        if (user.is_admin) {
          // Admin sees all requests
          userRequests = requestsWithEvents
        } else {
          // Filter requests this user should see
          userRequests = requestsWithEvents.filter((req) => {
            const isRequester = req.requester_id === user.id
            const isOwner = req.equipment?.owner_id === user.id
            const isForwarded = req.forwarded_to === user.id
            const isCurrentHolder = req.current_holder_id === user.id
            // Show forwarded requests only to the forwarded user, not the original approver
            const canSeeForwarded = req.forwarded_to && req.forwarded_to === user.id
            const isOriginalApprover = req.approved_by === user.id && !req.forwarded_to

            return isRequester || isOwner || canSeeForwarded || isCurrentHolder || isOriginalApprover
          })
        }

        setRequests(userRequests)
        setFilteredRequests(userRequests)
      } catch (error) {
        console.error("Error fetching requests:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [supabase, user])

  useEffect(() => {
    // Fetch all users for forwarding dropdown and return options
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from("users").select("id, name, is_admin").order("name")

        if (error) throw error
        setAllUsers(data || [])
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    fetchUsers()
  }, [supabase])

  useEffect(() => {
    // Filter requests based on search query and status
    let filtered = requests

    if (searchQuery) {
      filtered = filtered.filter(
        (request) =>
          request.equipment?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.events?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.requester?.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((request) => request.status === selectedStatus)
    }

    setFilteredRequests(filtered)
  }, [searchQuery, selectedStatus, requests])

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      const request = requests.find((r) => r.id === requestId)
      if (!request) return

      // Update request status to approved
      const { data, error } = await supabase
        .from("equipment_requests")
        .update({
          status: "approved",
          approved_by: user?.id,
          current_holder_id: request.requester_id,
        })
        .eq("id", requestId)
        .select(`
          *,
          equipment(*),
          requester:users!equipment_requests_requester_id_fkey(*),
          approver:users!equipment_requests_approved_by_fkey(*),
          forwarded_user:users!equipment_requests_forwarded_to_fkey(*),
          current_holder:users!equipment_requests_current_holder_id_fkey(*)
        `)
        .single()

      if (error) throw error

      // Update equipment status to in_use
      await supabase
        .from("equipment")
        .update({
          status: "in_use",
        })
        .eq("id", request.equipment_id)

      // Create equipment log
      await supabase.from("equipment_logs").insert({
        equipment_id: request.equipment_id,
        user_id: request.requester_id,
        checkout_time: new Date().toISOString(),
        expected_return_time: request.events?.end_time,
      })

      // Forward all other pending requests for the same equipment to the approved user
      const { data: otherRequests } = await supabase
        .from("equipment_requests")
        .select("id, requester_id")
        .eq("equipment_id", request.equipment_id)
        .eq("status", "pending")
        .neq("id", requestId)

      if (otherRequests && otherRequests.length > 0) {
        // Forward other requests to the user who got the equipment
        await supabase
          .from("equipment_requests")
          .update({
            forwarded_to: request.requester_id,
            notes: `Equipment approved for ${request.requester?.name}. Please coordinate with them for usage.`,
          })
          .eq("equipment_id", request.equipment_id)
          .eq("status", "pending")
          .neq("id", requestId)
      }

      // Refresh requests
      await refreshRequests()
    } catch (error) {
      console.error("Error approving request:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReceived = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      const { data, error } = await supabase
        .from("equipment_requests")
        .update({
          status: "received",
          received_time: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select(`
          *,
          equipment(*),
          requester:users!equipment_requests_requester_id_fkey(*),
          current_holder:users!equipment_requests_current_holder_id_fkey(*)
        `)
        .single()

      if (error) throw error

      await refreshRequests()
    } catch (error) {
      console.error("Error marking as received:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReturn = async (requestId: string) => {
    if (returnToUser === "other" && !returnToUser) {
      alert("Please select a user to return to")
      return
    }

    setProcessingId(requestId)
    try {
      const request = requests.find((r) => r.id === requestId)
      if (!request) return

      const returnTime = new Date().toISOString()

      if (returnToUser === "owner" || returnToUser === request.equipment?.owner_id) {
        // Returning to original owner - complete the cycle
        await supabase
          .from("equipment_requests")
          .update({
            status: "returned",
            returned_time: returnTime,
            return_condition: returnCondition,
            damage_notes: returnCondition === "damaged" ? damageNotes : null,
          })
          .eq("id", requestId)

        // Update equipment status
        await supabase
          .from("equipment")
          .update({
            status: "available",
            condition_notes: returnCondition === "damaged" ? damageNotes : null,
          })
          .eq("id", request.equipment_id)

        // Update equipment log
        const { data: logData } = await supabase
          .from("equipment_logs")
          .select("*")
          .eq("equipment_id", request.equipment_id)
          .eq("user_id", request.current_holder_id || request.requester_id)
          .is("return_time", null)
          .order("checkout_time", { ascending: false })
          .limit(1)
          .single()

        if (logData) {
          await supabase
            .from("equipment_logs")
            .update({
              return_time: returnTime,
            })
            .eq("id", logData.id)
        }

        // Create damage report if damaged
        if (returnCondition === "damaged" && damageNotes) {
          await supabase.from("damage_reports").insert({
            equipment_id: request.equipment_id,
            reported_by: user?.id,
            damage_description: damageNotes,
            severity: "moderate", // Default severity
          })
        }
      } else {
        // Transferring to another user
        const newHolderId = returnToUser

        // Update current request
        await supabase
          .from("equipment_requests")
          .update({
            status: "returned",
            returned_time: returnTime,
            current_holder_id: newHolderId,
          })
          .eq("id", requestId)

        // Create transfer record
        await supabase.from("equipment_transfers").insert({
          equipment_id: request.equipment_id,
          from_user_id: request.current_holder_id || request.requester_id,
          to_user_id: newHolderId,
          transfer_time: returnTime,
          notes: `Transferred via equipment request system`,
        })

        // Update equipment log
        const { data: logData } = await supabase
          .from("equipment_logs")
          .select("*")
          .eq("equipment_id", request.equipment_id)
          .eq("user_id", request.current_holder_id || request.requester_id)
          .is("return_time", null)
          .order("checkout_time", { ascending: false })
          .limit(1)
          .single()

        if (logData) {
          await supabase
            .from("equipment_logs")
            .update({
              return_time: returnTime,
              transferred_to: newHolderId,
              transfer_time: returnTime,
            })
            .eq("id", logData.id)
        }

        // Create new log for new holder
        await supabase.from("equipment_logs").insert({
          equipment_id: request.equipment_id,
          user_id: newHolderId,
          checkout_time: returnTime,
        })

        // Update any pending requests for this equipment to show new current holder
        await supabase
          .from("equipment_requests")
          .update({
            current_holder_id: newHolderId,
            notes: `Equipment transferred to new holder. Please coordinate with them.`,
          })
          .eq("equipment_id", request.equipment_id)
          .eq("status", "pending")
      }

      setReturningId(null)
      setReturnToUser("")
      setReturnCondition("perfect")
      setDamageNotes("")
      await refreshRequests()
    } catch (error) {
      console.error("Error processing return:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const refreshRequests = async () => {
    if (!user) return

    try {
      const { data: updatedRequests } = await supabase
        .from("equipment_requests")
        .select(`
          *,
          equipment(*),
          requester:users!equipment_requests_requester_id_fkey(*),
          approver:users!equipment_requests_approved_by_fkey(*),
          forwarded_user:users!equipment_requests_forwarded_to_fkey(*),
          current_holder:users!equipment_requests_current_holder_id_fkey(*)
        `)
        .order("created_at", { ascending: false })

      if (updatedRequests) {
        // Fetch events for updated requests
        const eventIds = updatedRequests.filter((req) => req.event_id).map((req) => req.event_id)
        if (eventIds.length > 0) {
          const { data: eventsForRequests } = await supabase.from("events").select("*").in("id", eventIds)
          const requestsWithEvents = updatedRequests.map((req) => ({
            ...req,
            events: req.event_id ? eventsForRequests?.find((e) => e.id === req.event_id) : null,
          }))

          // Filter for current user
          let userRequests: any[] = []
          if (user.is_admin) {
            userRequests = requestsWithEvents
          } else {
            userRequests = requestsWithEvents.filter((req) => {
              const isRequester = req.requester_id === user.id
              const isOwner = req.equipment?.owner_id === user.id
              const isForwarded = req.forwarded_to === user.id
              const isCurrentHolder = req.current_holder_id === user.id
              const canSeeForwarded = req.forwarded_to && req.forwarded_to === user.id
              const isOriginalApprover = req.approved_by === user.id && !req.forwarded_to

              return isRequester || isOwner || canSeeForwarded || isCurrentHolder || isOriginalApprover
            })
          }

          setRequests(userRequests)
          setFilteredRequests(userRequests)
        }
      }
    } catch (error) {
      console.error("Error refreshing requests:", error)
    }
  }

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      const { data, error } = await supabase
        .from("equipment_requests")
        .update({
          status: "rejected",
          approved_by: user?.id,
        })
        .eq("id", requestId)

      if (error) throw error
      await refreshRequests()
    } catch (error) {
      console.error("Error rejecting request:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleForward = async (requestId: string) => {
    if (!selectedForwardUser) {
      alert("Please select a user to forward to")
      return
    }

    setProcessingId(requestId)
    try {
      const { data, error } = await supabase
        .from("equipment_requests")
        .update({
          forwarded_to: selectedForwardUser,
          notes: `Forwarded by admin ${user?.name} to handle approval`,
        })
        .eq("id", requestId)

      if (error) throw error

      setForwardingId(null)
      setSelectedForwardUser("")
      await refreshRequests()
    } catch (error) {
      console.error("Error forwarding request:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const canApprove = (request: any) => {
    if (user?.is_admin) return true
    if (request.equipment?.owner_id && user?.id === request.equipment?.owner_id && !request.forwarded_to) return true
    if (request.forwarded_to === user?.id) return true
    return false
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        )
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        )
      case "received":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Received
          </span>
        )
      case "returned":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Returned
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Equipment Requests</h1>
        <p className="text-gray-600 mt-2">Manage equipment requests and approvals</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="md:w-64">
          <select className="select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="received">Received</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <li key={request.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          <Link to={`/equipment/${request.equipment?.id}`} className="hover:text-primary-600">
                            {request.equipment?.name}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.events?.title ? (
                            <>
                              For event:{" "}
                              <Link to="/calendar" className="hover:text-primary-600">
                                {request.events.title}
                              </Link>
                            </>
                          ) : (
                            "General use"
                          )}
                        </div>
                        {request.current_holder && (
                          <div className="text-xs text-blue-600 mt-1">
                            Currently with: {request.current_holder?.name}
                          </div>
                        )}
                        {request.notes && <div className="text-xs text-gray-500 mt-1">Note: {request.notes}</div>}
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">{getStatusBadge(request.status)}</div>
                  </div>

                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <div className="flex-shrink-0 mr-1.5">
                          <svg
                            className="h-4 w-4 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <Link to={`/members/${request.requester?.id}`} className="hover:text-primary-600">
                          {request.requester?.name}
                        </Link>
                      </div>
                      {request.forwarded_user && (
                        <div className="mt-2 flex items-center text-sm text-blue-600 sm:mt-0 sm:ml-6">
                          <div className="flex-shrink-0 mr-1.5">
                            <UserPlus className="h-4 w-4 text-blue-500" />
                          </div>
                          Forwarded to: {request.forwarded_user?.name}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {format(parseISO(request.created_at), "MMM d, yyyy")}
                    </div>
                  </div>

                  {/* Action buttons based on status and user role */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {/* Approve/Reject for pending requests */}
                    {request.status === "pending" && canApprove(request) && (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={!!processingId}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={!!processingId}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}

                    {/* Forward option for admins on hall equipment only */}
                    {request.status === "pending" &&
                      user?.is_admin &&
                      request.equipment?.ownership_type === "hall" &&
                      !request.forwarded_to && (
                        <>
                          {forwardingId === request.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                                value={selectedForwardUser}
                                onChange={(e) => setSelectedForwardUser(e.target.value)}
                              >
                                <option value="">Select user...</option>
                                {allUsers
                                  .filter((u) => u.id !== user.id)
                                  .map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.name} {u.is_admin ? "(Admin)" : ""}
                                    </option>
                                  ))}
                              </select>
                              <button
                                onClick={() => handleForward(request.id)}
                                disabled={!selectedForwardUser || !!processingId}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                              >
                                <Send className="mr-1 h-3 w-3" />
                                Forward
                              </button>
                              <button
                                onClick={() => {
                                  setForwardingId(null)
                                  setSelectedForwardUser("")
                                }}
                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setForwardingId(request.id)}
                              disabled={!!processingId}
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                              <UserPlus className="mr-1 h-4 w-4" />
                              Forward to User
                            </button>
                          )}
                        </>
                      )}

                    {/* Received button for approved requests (requester only) */}
                    {request.status === "approved" && request.requester_id === user?.id && (
                      <button
                        onClick={() => handleReceived(request.id)}
                        disabled={!!processingId}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Mark as Received
                      </button>
                    )}

                    {/* Return button for received requests (current holder) */}
                    {request.status === "received" &&
                      (request.current_holder_id === user?.id || request.requester_id === user?.id) && (
                        <>
                          {returningId === request.id ? (
                            <div className="flex flex-col gap-2 w-full">
                              <div className="flex items-center gap-2">
                                <select
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                  value={returnToUser}
                                  onChange={(e) => setReturnToUser(e.target.value)}
                                >
                                  <option value="">Return to...</option>
                                  <option value="owner">Equipment Owner</option>
                                  {allUsers
                                    .filter((u) => u.id !== user.id)
                                    .map((u) => (
                                      <option key={u.id} value={u.id}>
                                        {u.name}
                                      </option>
                                    ))}
                                </select>

                                <select
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                  value={returnCondition}
                                  onChange={(e) => setReturnCondition(e.target.value as "perfect" | "damaged")}
                                >
                                  <option value="perfect">Perfect Condition</option>
                                  <option value="damaged">Damaged</option>
                                </select>
                              </div>

                              {returnCondition === "damaged" && (
                                <textarea
                                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full"
                                  placeholder="Describe the damage..."
                                  value={damageNotes}
                                  onChange={(e) => setDamageNotes(e.target.value)}
                                  rows={2}
                                />
                              )}

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReturn(request.id)}
                                  disabled={
                                    !returnToUser || !!processingId || (returnCondition === "damaged" && !damageNotes)
                                  }
                                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                                >
                                  <ArrowRightLeft className="mr-1 h-3 w-3" />
                                  Return
                                </button>
                                <button
                                  onClick={() => {
                                    setReturningId(null)
                                    setReturnToUser("")
                                    setReturnCondition("perfect")
                                    setDamageNotes("")
                                  }}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReturningId(request.id)}
                              disabled={!!processingId}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                              <ArrowRightLeft className="mr-1 h-4 w-4" />
                              Return Equipment
                            </button>
                          )}
                        </>
                      )}

                    {processingId === request.id && (
                      <span className="inline-flex items-center text-xs text-gray-500">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No requests found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || selectedStatus !== "all"
              ? "Try adjusting your filters or search query."
              : "There are no equipment requests to display."}
          </p>
          <div className="mt-6">
            <Link
              to="/equipment"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Browse Equipment
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestsPage
