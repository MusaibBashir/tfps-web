"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "../contexts/SupabaseContext"
import { useAuth } from "../contexts/AuthContext"
import type { EquipmentRequest } from "../types"
import { formatToIST } from "../utils/timezone"

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
  const [hallUsers, setHallUsers] = useState<any[]>([])
  const [returningId, setReturningId] = useState<string | null>(null)
  const [returnToUser, setReturnToUser] = useState<string>("")
  const [returnCondition, setReturnCondition] = useState<"perfect" | "damaged">("perfect")
  const [damageNotes, setDamageNotes] = useState("")
  const [equipmentInPossession, setEquipmentInPossession] = useState<any[]>([])
  const [showOtherUsers, setShowOtherUsers] = useState(false)

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
            const { data: eventsForRequests } = await supabase
              .from("events")
              .select("*, creator:created_by(*)")
              .in("id", eventIds)

            // Manually attach events to requests
            requestsWithEvents = requestsWithEvents.map((req) => ({
              ...req,
              events: req.event_id ? eventsForRequests?.find((e) => e.id === req.event_id) : null,
            }))
          }
        }

        // Get equipment currently in user's possession (from equipment_logs)
        const { data: equipmentLogs } = await supabase
          .from("equipment_logs")
          .select(`
            *,
            equipment(*),
            user:user_id(*)
          `)
          .eq("user_id", user.id)
          .is("return_time", null)

        setEquipmentInPossession(equipmentLogs || [])

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
            const isOriginalApprover = req.approved_by === user.id && !req.forwarded_to

            return isRequester || isOwner || isForwarded || isCurrentHolder || isOriginalApprover
          })
        }

        setRequests(userRequests)
        setFilteredRequests(userRequests)

        // Check for any inconsistencies after loading
        setTimeout(() => {
          fixMissingForwards(userRequests)
        }, 1000)
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
        const { data, error } = await supabase.from("users").select("id, name, hostel, is_admin").order("name")

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

      // Check if equipment is currently in use by looking at equipment_logs
      const { data: currentLog } = await supabase
        .from("equipment_logs")
        .select("*, user:user_id(*)")
        .eq("equipment_id", request.equipment_id)
        .is("return_time", null)
        .order("checkout_time", { ascending: false })
        .limit(1)
        .single()

      if (currentLog && currentLog.user_id !== request.requester_id) {
        // Equipment is currently with someone else - forward the request to them
        const currentHolderName = currentLog.user?.name || "current user"
        const currentHolderId = currentLog.user_id

        await supabase
          .from("equipment_requests")
          .update({
            status: "approved",
            approved_by: user?.id,
            forwarded_to: currentHolderId,
            notes: `Handover request sent to ${currentHolderName}`,
          })
          .eq("id", requestId)

        console.log(`Request ${requestId} forwarded to current holder: ${currentHolderName}`)
      } else {
        // No one has the equipment currently - approve normally
        await supabase
          .from("equipment_requests")
          .update({
            status: "approved",
            approved_by: user?.id,
            current_holder_id: request.requester_id,
          })
          .eq("id", requestId)

        // Update equipment status to in_use and create log
        await supabase
          .from("equipment")
          .update({
            status: "in_use",
          })
          .eq("id", request.equipment_id)

        await supabase.from("equipment_logs").insert({
          equipment_id: request.equipment_id,
          user_id: request.requester_id,
          checkout_time: new Date().toISOString(),
          expected_return_time: request.end_time,
        })

        console.log(`Request ${requestId} approved and equipment given to requester`)
      }

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

      if (error) throw error
      await refreshRequests()
    } catch (error) {
      console.error("Error marking as received:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const getReturnOptions = (request: any) => {
    const options = []

    // Check if current user is the equipment owner
    const isOwner = request.equipment?.owner_id === user?.id
    const isAdmin = user?.is_admin
    const isHallEquipment = request.equipment?.ownership_type === "hall"

    // If user is the owner, they shouldn't see any return options
    if (isOwner) {
      return []
    }

    // Always show return to owner option for non-owners
    if (request.equipment?.owner_id) {
      const owner = allUsers.find((u) => u.id === request.equipment.owner_id)
      if (owner) {
        options.push({ value: request.equipment.owner_id, label: `Return to Owner (${owner.name})` })
      }
    } else if (isHallEquipment && !isAdmin) {
      options.push({ value: "admin", label: "Return to Admin" })
    }

    // Get handover requests - ALL approved requests for this equipment that are forwarded to current user
    const allHandoverRequests = requests.filter(
      (r) =>
        r.equipment_id === request.equipment_id &&
        r.status === "approved" &&
        r.forwarded_to === user?.id &&
        r.id !== request.id,
    )

    console.log("Debug - Looking for handover requests:", {
      equipmentId: request.equipment_id,
      userId: user?.id,
      allRequests: requests.length,
      handoverRequests: allHandoverRequests,
      currentRequest: request.id,
    })

    allHandoverRequests.forEach((handoverReq) => {
      if (handoverReq.requester) {
        options.push({
          value: handoverReq.requester.id,
          label: `Handover to ${handoverReq.requester.name}`,
          requestId: handoverReq.id,
        })
      }
    })

    return options
  }

  const handleReturn = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      const request = requests.find((r) => r.id === requestId)
      if (!request) return

      const returnTime = new Date().toISOString()
      const finalReturnUser = returnToUser

      // Find the option that was selected
      const returnOptions = getReturnOptions(request)
      const selectedOption = returnOptions.find((opt) => opt.value === finalReturnUser)

      if (finalReturnUser === request.equipment?.owner_id || finalReturnUser === "admin") {
        // Returning to original owner/admin - complete the cycle
        await supabase
          .from("equipment_requests")
          .update({
            status: "returned",
            returned_time: returnTime,
            return_condition: returnCondition,
            damage_notes: returnCondition === "damaged" ? damageNotes : null,
          })
          .eq("id", requestId)

        // Update equipment status directly - no owner confirmation needed
        await supabase
          .from("equipment")
          .update({
            status: returnCondition === "damaged" ? "maintenance" : "available",
            condition_notes: returnCondition === "damaged" ? damageNotes : null,
          })
          .eq("id", request.equipment_id)

        // Update equipment log for current user
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

        // Clear forwarded_to for any approved requests for this equipment
        await supabase
          .from("equipment_requests")
          .update({
            forwarded_to: null,
            notes: `Equipment returned to owner. Ready to give to requester.`,
          })
          .eq("equipment_id", request.equipment_id)
          .eq("status", "approved")
          .not("forwarded_to", "is", null)
          .neq("id", requestId)

        // Create damage report if damaged
        if (returnCondition === "damaged" && damageNotes) {
          await supabase.from("damage_reports").insert({
            equipment_id: request.equipment_id,
            reported_by: user?.id,
            damage_description: damageNotes,
            severity: "moderate",
          })
        }

        console.log(`Equipment returned to owner/admin from request ${requestId}`)
      } else if (selectedOption && selectedOption.requestId) {
        // Handover to another user with approved request
        const newHolderId = finalReturnUser
        const handoverRequestId = selectedOption.requestId

        // Update current request to returned with handover note
        await supabase
          .from("equipment_requests")
          .update({
            status: "returned",
            returned_time: returnTime,
            notes: `Handed over to ${allUsers.find((u) => u.id === newHolderId)?.name}`,
          })
          .eq("id", requestId)

        // Update the handover request to received status
        await supabase
          .from("equipment_requests")
          .update({
            status: "received",
            received_time: returnTime,
            current_holder_id: newHolderId,
            forwarded_to: null,
            notes: `Equipment received via handover from ${user?.name}`,
          })
          .eq("id", handoverRequestId)

        // Create transfer record
        await supabase.from("equipment_transfers").insert({
          equipment_id: request.equipment_id,
          from_user_id: request.current_holder_id || request.requester_id,
          to_user_id: newHolderId,
          transfer_time: returnTime,
          notes: `Handover via equipment request system`,
        })

        // Update equipment log for current holder (end their usage)
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

        // Create new log for new holder (start their usage)
        const handoverRequest = requests.find((r) => r.id === handoverRequestId)
        await supabase.from("equipment_logs").insert({
          equipment_id: request.equipment_id,
          user_id: newHolderId,
          checkout_time: returnTime,
          expected_return_time: handoverRequest?.end_time,
        })

        console.log(`Equipment handed over from ${user?.name} to ${allUsers.find((u) => u.id === newHolderId)?.name}`)
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

  const handleGiveEquipment = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      const request = requests.find((r) => r.id === requestId)
      if (!request) return

      const giveTime = new Date().toISOString()

      // Update request to received status
      await supabase
        .from("equipment_requests")
        .update({
          status: "received",
          received_time: giveTime,
          current_holder_id: request.requester_id,
          notes: `Equipment given by owner`,
        })
        .eq("id", requestId)

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
        checkout_time: giveTime,
        expected_return_time: request.end_time,
      })

      console.log(`Owner gave equipment to requester for request ${requestId}`)
      await refreshRequests()
    } catch (error) {
      console.error("Error giving equipment:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReturnFromPossession = async (equipmentLog: any) => {
    setProcessingId(equipmentLog.id)
    try {
      const returnTime = new Date().toISOString()

      // Check if this is a handover to another user
      const isHandover = returnToUser !== equipmentLog.equipment?.owner_id && returnToUser !== "admin"

      if (isHandover) {
        // This is a handover - find the corresponding request
        const handoverRequest = requests.find(
          (r) =>
            r.equipment_id === equipmentLog.equipment_id &&
            r.status === "approved" &&
            r.forwarded_to === user?.id &&
            r.requester_id === returnToUser,
        )

        if (handoverRequest) {
          // Update the handover request to received status
          await supabase
            .from("equipment_requests")
            .update({
              status: "received",
              received_time: returnTime,
              current_holder_id: returnToUser,
              forwarded_to: null,
              notes: `Equipment received via handover from ${user?.name}`,
            })
            .eq("id", handoverRequest.id)

          // Create transfer record
          await supabase.from("equipment_transfers").insert({
            equipment_id: equipmentLog.equipment_id,
            from_user_id: user?.id,
            to_user_id: returnToUser,
            transfer_time: returnTime,
            notes: `Handover via equipment request system`,
          })

          // Update current equipment log (end current user's usage)
          await supabase
            .from("equipment_logs")
            .update({
              return_time: returnTime,
              transferred_to: returnToUser,
              transfer_time: returnTime,
            })
            .eq("id", equipmentLog.id)

          // Create new log for new holder (start their usage)
          await supabase.from("equipment_logs").insert({
            equipment_id: equipmentLog.equipment_id,
            user_id: returnToUser,
            checkout_time: returnTime,
            expected_return_time: handoverRequest.end_time,
          })

          // Find and update the current user's request to returned
          const currentUserRequest = requests.find(
            (r) =>
              r.equipment_id === equipmentLog.equipment_id && r.status === "received" && r.requester_id === user?.id,
          )

          if (currentUserRequest) {
            await supabase
              .from("equipment_requests")
              .update({
                status: "returned",
                returned_time: returnTime,
                notes: `Handed over to ${allUsers.find((u) => u.id === returnToUser)?.name}`,
              })
              .eq("id", currentUserRequest.id)
          }

          console.log(`Handover completed from possession to ${allUsers.find((u) => u.id === returnToUser)?.name}`)
        }
      } else {
        // Regular return to owner/admin
        await supabase
          .from("equipment")
          .update({
            status: returnCondition === "damaged" ? "maintenance" : "available",
            condition_notes: returnCondition === "damaged" ? damageNotes : null,
          })
          .eq("id", equipmentLog.equipment_id)

        // Update equipment log
        await supabase
          .from("equipment_logs")
          .update({
            return_time: returnTime,
          })
          .eq("id", equipmentLog.id)

        // Clear forwarded_to for any approved requests for this equipment
        await supabase
          .from("equipment_requests")
          .update({
            forwarded_to: null,
            notes: `Equipment returned to owner. Ready to give to requester.`,
          })
          .eq("equipment_id", equipmentLog.equipment_id)
          .eq("status", "approved")
          .not("forwarded_to", "is", null)

        // Update current user's request to returned
        const currentUserRequest = requests.find(
          (r) => r.equipment_id === equipmentLog.equipment_id && r.status === "received" && r.requester_id === user?.id,
        )

        if (currentUserRequest) {
          await supabase
            .from("equipment_requests")
            .update({
              status: "returned",
              returned_time: returnTime,
              return_condition: returnCondition,
              damage_notes: returnCondition === "damaged" ? damageNotes : null,
            })
            .eq("id", currentUserRequest.id)
        }

        // Create damage report if damaged
        if (returnCondition === "damaged" && damageNotes) {
          await supabase.from("damage_reports").insert({
            equipment_id: equipmentLog.equipment_id,
            reported_by: user?.id,
            damage_description: damageNotes,
            severity: "moderate",
          })
        }

        console.log(`Equipment returned to owner/admin from possession`)
      }

      setReturningId(null)
      setReturnToUser("")
      setReturnCondition("perfect")
      setDamageNotes("")
      await refreshRequests()
    } catch (error) {
      console.error("Error processing return from possession:", error)
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
        let requestsWithEvents = updatedRequests

        if (eventIds.length > 0) {
          const { data: eventsForRequests } = await supabase
            .from("events")
            .select("*, creator:created_by(*)")
            .in("id", eventIds)
          requestsWithEvents = updatedRequests.map((req) => ({
            ...req,
            events: req.event_id ? eventsForRequests?.find((e) => e.id === req.event_id) : null,
          }))
        }

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
            const isOriginalApprover = req.approved_by === user.id && !req.forwarded_to

            return isRequester || isOwner || isForwarded || isCurrentHolder || isOriginalApprover
          })
        }

        setRequests(userRequests)
        setFilteredRequests(userRequests)
      }

      // Refresh equipment in possession
      const { data: equipmentLogs } = await supabase
        .from("equipment_logs")
        .select(`
          *,
          equipment(*),
          user:user_id(*)
        `)
        .eq("user_id", user.id)
        .is("return_time", null)

      setEquipmentInPossession(equipmentLogs || [])
    } catch (error) {
      console.error("Error refreshing requests:", error)
    }
  }

  const fixMissingForwards = async (currentRequests?: any[]) => {
    const requestsToCheck = currentRequests || requests
    if (!requestsToCheck.length) return

    try {
      // Find approved requests that should be forwarded but aren't
      const approvedRequests = requestsToCheck.filter(
        (r) => r.status === "approved" && !r.forwarded_to && !r.received_time && r.current_holder_id !== r.requester_id,
      )

      for (const request of approvedRequests) {
        // Check if equipment is currently in use
        const { data: currentLog } = await supabase
          .from("equipment_logs")
          .select("*, user:user_id(*)")
          .eq("equipment_id", request.equipment_id)
          .is("return_time", null)
          .order("checkout_time", { ascending: false })
          .limit(1)
          .single()

        if (currentLog && currentLog.user_id !== request.requester_id) {
          // This request should be forwarded to the current holder
          console.log(`Auto-forwarding request ${request.id} to current holder: ${currentLog.user?.name}`)

          await supabase
            .from("equipment_requests")
            .update({
              forwarded_to: currentLog.user_id,
              notes: `Auto-forwarded to current equipment holder: ${currentLog.user?.name}`,
            })
            .eq("id", request.id)
        }
      }

      // Only refresh if we made changes
      if (approvedRequests.length > 0) {
        await refreshRequests()
      }
    } catch (error) {
      console.error("Error fixing missing forwards:", error)
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
      setShowOtherUsers(false)
      await refreshRequests()
    } catch (error) {
      console.error("Error forwarding request:", error)
    } finally {
      setProcessingId(null)
    }
  }

  const getForwardingUsers = (request: any) => {
    if (request.equipment?.ownership_type === "hall" && request.equipment?.hall) {
      return allUsers.filter((u) => u.hostel === request.equipment.hall)
    }
    return []
  }

  const canApprove = (request: any) => {
    if (user?.is_admin) return true
    if (request.equipment?.owner_id && user?.id === request.equipment?.owner_id && !request.forwarded_to) return true
    if (request.forwarded_to === user?.id) return true
    return false
  }

  const getStatusBadge = (status: string, autoDeclined?: boolean) => {
    if (status === "rejected" && autoDeclined) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Auto-Declined
        </span>
      )
    }

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
            In Use
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

      {/* Equipment in Possession Section */}
      {equipmentInPossession.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Equipment in Your Possession</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-3">
              {equipmentInPossession.map((log) => {
                // Check if there are any handover requests for this equipment (forwarded to current user)
                const handoverRequests = requests.filter(
                  (r) => r.equipment_id === log.equipment_id && r.status === "approved" && r.forwarded_to === user?.id,
                )

                console.log("Debug - Possession handover check:", {
                  equipmentId: log.equipment_id,
                  equipmentName: log.equipment?.name,
                  userId: user?.id,
                  handoverRequests: handoverRequests.length,
                  requestDetails: handoverRequests.map((r) => ({ id: r.id, requester: r.requester?.name })),
                })

                return (
                  <div key={log.id} className="flex items-center justify-between bg-white p-3 rounded-md">
                    <div>
                      <span className="font-medium text-gray-900">{log.equipment?.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        Since{" "}
                        {log.checkout_time ? formatToIST(log.checkout_time, "MMM d, yyyy h:mm a") : "Unknown time"}
                      </span>
                      {log.expected_return_time && (
                        <span className="text-xs text-gray-400 ml-2">
                          Expected return:{" "}
                          {log.expected_return_time
                            ? formatToIST(log.expected_return_time, "MMM d, h:mm a")
                            : "Unknown time"}
                        </span>
                      )}
                      {handoverRequests.length > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          {handoverRequests.length} handover request(s) pending:{" "}
                          {handoverRequests.map((r) => r.requester?.name).join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {returningId === `possession-${log.id}` ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <select
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                              value={returnToUser}
                              onChange={(e) => setReturnToUser(e.target.value)}
                            >
                              <option value="">Choose action...</option>
                              <option value={log.equipment?.owner_id || "admin"}>
                                Return to{" "}
                                {log.equipment?.owner_id
                                  ? allUsers.find((u) => u.id === log.equipment.owner_id)?.name
                                  : "Admin"}
                              </option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                          onClick={() => setReturningId(`possession-${log.id}`)}
                        >
                          Return
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Requests Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Requests</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4">
              <input
                type="text"
                className="border border-gray-300 rounded px-2 py-1"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="text-xs border border-gray-300 rounded px-2 py-1"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="received">In Use</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <div>
                  <span className="font-medium text-gray-900">{request.equipment?.name}</span>
                  <span className="text-sm text-gray-500 ml-2">Requested by {request.requester?.name}</span>
                  {request.events && <span className="text-sm text-gray-500 ml-2">Event: {request.events.title}</span>}
                  <div className="text-xs text-gray-400 mt-1">{getStatusBadge(request.status)}</div>
                </div>
                <div className="flex gap-2">
                  {processingId === request.id ? (
                    <span className="text-xs text-gray-500">Processing...</span>
                  ) : (
                    <>
                      {canApprove(request) && (
                        <button
                          className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                          onClick={() => handleApprove(request.id)}
                        >
                          Approve
                        </button>
                      )}
                      {request.status === "approved" && !request.received_time && (
                        <button
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                          onClick={() => handleReceived(request.id)}
                        >
                          Received
                        </button>
                      )}
                      {request.status === "received" && (
                        <button
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                          onClick={() => setReturningId(request.id)}
                        >
                          Return
                        </button>
                      )}
                      {request.status === "pending" && user.is_admin && (
                        <button
                          className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
                          onClick={() => setForwardingId(request.id)}
                        >
                          Forward
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forwarding Modal */}
      {forwardingId && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Forward Request</h3>
            <select
              className="text-xs border border-gray-300 rounded px-2 py-1 w-full mb-4"
              value={selectedForwardUser}
              onChange={(e) => setSelectedForwardUser(e.target.value)}
            >
              <option value="">Select User...</option>
              {getForwardingUsers(requests.find((r) => r.id === forwardingId)).map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <button
                className="text-xs bg-gray-500 text-white px-2 py-1 rounded mr-2"
                onClick={() => {
                  setForwardingId(null)
                  setSelectedForwardUser("")
                  setShowOtherUsers(false)
                }}
              >
                Cancel
              </button>
              <button
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() => handleForward(forwardingId)}
              >
                Forward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Returning Modal */}
      {returningId && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Return Equipment</h3>
            <select
              className="text-xs border border-gray-300 rounded px-2 py-1 w-full mb-4"
              value={returnToUser}
              onChange={(e) => setReturnToUser(e.target.value)}
            >
              <option value="">Select User...</option>
              {getReturnOptions(requests.find((r) => r.id === returningId)).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-gray-500">Condition:</span>
              <select
                className="text-xs border border-gray-300 rounded px-2 py-1"
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value as "perfect" | "damaged")}
              >
                <option value="perfect">Perfect</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
            {returnCondition === "damaged" && (
              <textarea
                className="border border-gray-300 rounded px-2 py-1 w-full mb-4"
                placeholder="Enter damage notes..."
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
              />
            )}
            <div className="flex justify-end">
              <button
                className="text-xs bg-gray-500 text-white px-2 py-1 rounded mr-2"
                onClick={() => {
                  setReturningId(null)
                  setReturnToUser("")
                  setReturnCondition("perfect")
                  setDamageNotes("")
                }}
              >
                Cancel
              </button>
              <button
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() => handleReturn(returningId)}
              >
                Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestsPage
