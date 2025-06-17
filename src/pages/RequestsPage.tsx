"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  ClipboardList,
  Search,
  CheckCircle,
  XCircle,
  Package,
  UserPlus,
  Send,
  ArrowRightLeft,
  Clock,
  User,
} from "lucide-react"
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

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm("Are you sure you want to delete this request?")) {
      return
    }

    setProcessingId(requestId)
    try {
      const { error } = await supabase.from("equipment_requests").delete().eq("id", requestId)

      if (error) throw error
      await refreshRequests()
    } catch (error) {
      console.error("Error deleting request:", error)
    } finally {
      setProcessingId(null)
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
                                Return to {log.equipment?.owner_id ? "Owner" : "Admin"}
                              </option>
                              {handoverRequests.map((req) => (
                                <option key={req.id} value={req.requester_id}>
                                  Handover to {req.requester?.name}
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
                              onClick={() => handleReturnFromPossession(log)}
                              disabled={
                                !!processingId || !returnToUser || (returnCondition === "damaged" && !damageNotes)
                              }
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                              <ArrowRightLeft className="mr-1 h-3 w-3" />
                              {returnToUser === log.equipment?.owner_id || returnToUser === "admin"
                                ? "Return"
                                : "Handover"}
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
                          onClick={() => setReturningId(`possession-${log.id}`)}
                          disabled={!!processingId}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                          <ArrowRightLeft className="mr-1 h-4 w-4" />
                          {handoverRequests.length > 0 ? "Return/Handover" : "Return Equipment"}
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
            <option value="received">In Use</option>
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
            {filteredRequests.map((request) => {
              const returnOptions = getReturnOptions(request)
              const showReturnButton =
                request.status === "received" &&
                (request.current_holder_id === user?.id || request.requester_id === user?.id) &&
                returnOptions.length > 0

              // Check if this is an approved request that owner can give equipment to
              const canGiveEquipment =
                request.status === "approved" &&
                !request.forwarded_to &&
                request.equipment?.owner_id === user?.id &&
                request.equipment?.status === "available"

              return (
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
                            {request.equipment?.ownership_type === "student" &&
                              request.equipment?.owner_id &&
                              user?.is_admin && <span className="ml-2 text-xs text-blue-600">(Student-owned)</span>}
                            {request.equipment?.ownership_type === "hall" && request.equipment?.hall && (
                              <span className="ml-2 text-xs text-green-600">({request.equipment.hall})</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.events?.title ? (
                              <>
                                For event:{" "}
                                <Link to="/calendar" className="hover:text-primary-600">
                                  {request.events.title}
                                </Link>
                                {request.events.creator && (
                                  <span className="text-xs text-gray-400 ml-1">(by {request.events.creator.name})</span>
                                )}
                              </>
                            ) : (
                              "General use"
                            )}
                            {request.start_time && request.end_time && (
                              <span className="ml-2 text-xs text-gray-400">
                                <Clock className="inline h-3 w-3 mr-1" />
                                {formatToIST(request.start_time, "MMM d, h:mm a")} -{" "}
                                {formatToIST(request.end_time, "h:mm a")}
                              </span>
                            )}
                          </div>
                          {request.current_holder && (
                            <div className="text-xs text-blue-600 mt-1">
                              Equipment in use with: {request.current_holder?.name}
                            </div>
                          )}
                          {request.notes && <div className="text-xs text-gray-500 mt-1">Note: {request.notes}</div>}
                          {request.auto_declined && request.declined_reason && (
                            <div className="text-xs text-orange-600 mt-1">{request.declined_reason}</div>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {getStatusBadge(request.status, request.auto_declined)}
                      </div>
                    </div>

                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <div className="flex-shrink-0 mr-1.5">
                            <User className="h-4 w-4 text-gray-400" />
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
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {request.created_at ? formatToIST(request.created_at, "MMM d, yyyy") : "Unknown date"}
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

                      {/* Give Equipment button for owner when equipment is available */}
                      {canGiveEquipment && (
                        <button
                          onClick={() => handleGiveEquipment(request.id)}
                          disabled={!!processingId}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          <Package className="mr-1 h-4 w-4" />
                          Give Equipment
                        </button>
                      )}

                      {/* Forward option for admins on hall equipment */}
                      {request.status === "pending" &&
                        user?.is_admin &&
                        request.equipment?.ownership_type === "hall" &&
                        !request.forwarded_to && (
                          <>
                            {forwardingId === request.id ? (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <select
                                    className="text-xs border border-gray-300 rounded px-2 py-1"
                                    value={selectedForwardUser}
                                    onChange={(e) => {
                                      setSelectedForwardUser(e.target.value)
                                      if (e.target.value === "other") {
                                        setShowOtherUsers(true)
                                        setHallUsers(getForwardingUsers(request))
                                      } else {
                                        setShowOtherUsers(false)
                                      }
                                    }}
                                  >
                                    <option value="">Select user...</option>
                                    {getForwardingUsers(request).map((u) => (
                                      <option key={u.id} value={u.id}>
                                        {u.name} ({u.hostel})
                                      </option>
                                    ))}
                                    <option value="other">Others...</option>
                                  </select>

                                  {showOtherUsers && (
                                    <select
                                      className="text-xs border border-gray-300 rounded px-2 py-1"
                                      value={selectedForwardUser === "other" ? "" : selectedForwardUser}
                                      onChange={(e) => setSelectedForwardUser(e.target.value)}
                                    >
                                      <option value="">Select from all users...</option>
                                      {allUsers
                                        .filter(
                                          (u) =>
                                            u.id !== user.id &&
                                            !getForwardingUsers(request).find((hu) => hu.id === u.id),
                                        )
                                        .map((u) => (
                                          <option key={u.id} value={u.id}>
                                            {u.name} {u.is_admin ? "(Admin)" : ""}
                                          </option>
                                        ))}
                                    </select>
                                  )}

                                  <button
                                    onClick={() => handleForward(request.id)}
                                    disabled={!selectedForwardUser || selectedForwardUser === "other" || !!processingId}
                                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                  >
                                    <Send className="mr-1 h-3 w-3" />
                                    Forward
                                  </button>
                                  <button
                                    onClick={() => {
                                      setForwardingId(null)
                                      setSelectedForwardUser("")
                                      setShowOtherUsers(false)
                                    }}
                                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                  >
                                    Cancel
                                  </button>
                                </div>
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
                      {request.status === "approved" && request.requester_id === user?.id && !request.forwarded_to && (
                        <button
                          onClick={() => handleReceived(request.id)}
                          disabled={!!processingId}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Mark as Received
                        </button>
                      )}

                      {/* Return button for received requests */}
                      {showReturnButton && (
                        <>
                          {returningId === request.id ? (
                            <div className="flex flex-col gap-2 w-full">
                              <div className="flex items-center gap-2">
                                <select
                                  className="text-xs border border-gray-300 rounded px-2 py-1"
                                  value={returnToUser}
                                  onChange={(e) => setReturnToUser(e.target.value)}
                                >
                                  <option value="">Choose action...</option>
                                  {returnOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
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
                                  {returnToUser === request.equipment?.owner_id || returnToUser === "admin"
                                    ? "Return"
                                    : "Handover"}
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
                              Return/Handover
                            </button>
                          )}
                        </>
                      )}

                      {/* Delete button for own pending requests */}
                      {request.status === "pending" && request.requester_id === user?.id && (
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          disabled={!!processingId}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Delete
                        </button>
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
              )
            })}
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
