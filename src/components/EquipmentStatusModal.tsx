"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, User } from "lucide-react"
import { useSupabase } from "../contexts/SupabaseContext"
import type { Equipment, User as UserType } from "../types"

interface EquipmentStatusModalProps {
  equipment: Equipment
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedEquipment: Equipment) => void
  currentUser: UserType
}

const EquipmentStatusModal: React.FC<EquipmentStatusModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onUpdate,
  currentUser,
}) => {
  const { supabase } = useSupabase()
  const [status, setStatus] = useState(equipment.status)
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUserInfo, setCurrentUserInfo] = useState<UserType | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from("users").select("*").order("name")

        if (error) throw error
        setUsers(data || [])
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    const fetchCurrentUser = async () => {
      if (equipment.status === "in_use") {
        try {
          // Get the current user who has this equipment
          const { data, error } = await supabase
            .from("equipment_logs")
            .select("*, user:user_id(*)")
            .eq("equipment_id", equipment.id)
            .is("return_time", null)
            .order("checkout_time", { ascending: false })
            .limit(1)
            .single()

          if (error && error.code !== "PGRST116") {
            // PGRST116 is "not found" error, which is okay
            throw error
          }

          if (data?.user) {
            setCurrentUserInfo(data.user as UserType)
          }
        } catch (error) {
          console.error("Error fetching current user:", error)
        }
      }
    }

    if (isOpen) {
      setStatus(equipment.status)
      setSelectedUser("")
      setError(null)
      setCurrentUserInfo(null)
      fetchUsers()
      fetchCurrentUser()
    }
  }, [isOpen, equipment, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (status === "in_use" && !selectedUser) {
        setError("Please select a user when marking equipment as in use")
        return
      }

      // Check if equipment is damaged and user is trying to change from maintenance
      if (
        equipment.status === "maintenance" &&
        status !== "maintenance" &&
        !currentUser.is_admin &&
        equipment.owner_id !== currentUser.id
      ) {
        setError("Only admins or equipment owners can change the status of damaged equipment")
        return
      }

      // Update equipment status
      const { data: updatedEquipment, error: equipmentError } = await supabase
        .from("equipment")
        .update({ status })
        .eq("id", equipment.id)
        .select("*")
        .single()

      if (equipmentError) throw equipmentError

      if (status === "in_use" && selectedUser) {
        // Create equipment log entry
        await supabase.from("equipment_logs").insert({
          equipment_id: equipment.id,
          user_id: selectedUser,
          checkout_time: new Date().toISOString(),
        })
      } else if (status === "available" && equipment.status === "in_use") {
        // Mark current log as returned
        const { data: currentLog } = await supabase
          .from("equipment_logs")
          .select("*")
          .eq("equipment_id", equipment.id)
          .is("return_time", null)
          .order("checkout_time", { ascending: false })
          .limit(1)
          .single()

        if (currentLog) {
          await supabase
            .from("equipment_logs")
            .update({ return_time: new Date().toISOString() })
            .eq("id", currentLog.id)
        }
      }

      onUpdate(updatedEquipment)
      onClose()
    } catch (error: any) {
      console.error("Error updating equipment status:", error)
      setError(error.message || "Failed to update equipment status")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Update Equipment Status</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Equipment: <span className="font-medium text-gray-900">{equipment.name}</span>
              </p>
              <p className="text-sm text-gray-500">
                Current status: <span className="capitalize">{equipment.status.replace("_", " ")}</span>
              </p>
            </div>

            {equipment.status === "in_use" && currentUserInfo && (
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm text-blue-700">
                    Currently with: <strong>{currentUserInfo.name}</strong>
                  </span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                New Status
              </label>
              <select
                id="status"
                className="select mt-1"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                required
              >
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {status === "in_use" && (
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                  Assign to User
                </label>
                <select
                  id="user"
                  className="select mt-1"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  required
                >
                  <option value="">Select a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.domain})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}
          </div>

          <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EquipmentStatusModal
