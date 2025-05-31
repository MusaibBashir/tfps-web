"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Package, User, Calendar, Clock, ChevronDown, ChevronUp, Settings } from "lucide-react"
import { useSupabase } from "../contexts/SupabaseContext"
import { useAuth } from "../contexts/AuthContext"
import type { Equipment, EquipmentLog, User as UserType } from "../types"
import RequestEquipmentModal from "../components/RequestEquipmentModal"
import EquipmentStatusModal from "../components/EquipmentStatusModal"

const EquipmentDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { supabase } = useSupabase()
  const { user } = useAuth()

  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [accessories, setAccessories] = useState<Equipment[]>([])
  const [history, setHistory] = useState<EquipmentLog[]>([])
  const [owner, setOwner] = useState<UserType | null>(null)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [showAccessories, setShowAccessories] = useState(true)
  const [loading, setLoading] = useState(true)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  useEffect(() => {
    const fetchEquipmentDetails = async () => {
      if (!id) return

      setLoading(true)
      try {
        // Fetch equipment details
        const { data: equipmentData, error: equipmentError } = await supabase
          .from("equipment")
          .select("*")
          .eq("id", id)
          .single()

        if (equipmentError) throw equipmentError

        if (equipmentData) {
          setEquipment(equipmentData)

          // Fetch accessories/lenses if this is a camera
          if (equipmentData.type === "camera") {
            const { data: accessoriesData } = await supabase
              .from("equipment")
              .select("*")
              .eq("parent_id", id)
              .order("name")

            setAccessories(accessoriesData || [])
          }

          // Fetch owner details if student-owned
          if (equipmentData.ownership_type === "student" && equipmentData.owner_id) {
            const { data: ownerData } = await supabase
              .from("users")
              .select("*")
              .eq("id", equipmentData.owner_id)
              .single()

            setOwner(ownerData || null)
          }

          // Fetch current user if equipment is in use
          if (equipmentData.status === "in_use") {
            const { data: currentLogData } = await supabase
              .from("equipment_logs")
              .select("*, user:user_id(*)")
              .eq("equipment_id", id)
              .is("return_time", null)
              .order("checkout_time", { ascending: false })
              .limit(1)
              .single()

            if (currentLogData?.user) {
              setCurrentUser(currentLogData.user as UserType)
            }
          }

          // Fetch equipment history
          const { data: historyData } = await supabase
            .from("equipment_logs")
            .select("*, user:user_id(*)")
            .eq("equipment_id", id)
            .order("checkout_time", { ascending: false })
            .limit(5)

          setHistory(historyData || [])
        }
      } catch (error) {
        console.error("Error fetching equipment details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEquipmentDetails()
  }, [id, supabase])

  const canManageStatus = () => {
    if (!user || !equipment) return false
    return user.is_admin || (equipment.owner_id && user.id === equipment.owner_id)
  }

  const handleEquipmentUpdate = (updatedEquipment: Equipment) => {
    setEquipment(updatedEquipment)
    // Refresh the page data to get updated current user info
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!equipment) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Equipment not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The equipment you're looking for doesn't exist or has been removed.
        </p>
        <div className="mt-6">
          <Link
            to="/equipment"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Equipment
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          to="/equipment"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Equipment
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div
          className={`p-6 sm:p-8 ${
            equipment.status === "available"
              ? "bg-green-50"
              : equipment.status === "in_use"
                ? "bg-yellow-50"
                : "bg-red-50"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div
              className={`p-6 rounded-full bg-white ${
                equipment.status === "available"
                  ? "text-green-500"
                  : equipment.status === "in_use"
                    ? "text-yellow-500"
                    : "text-red-500"
              }`}
            >
              <Package className="h-12 w-12" />
            </div>
            <div className="text-center sm:text-left flex-grow">
              <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
              <p className="text-gray-600 mt-1">{equipment.type.charAt(0).toUpperCase() + equipment.type.slice(1)}</p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    equipment.status === "available"
                      ? "bg-green-100 text-green-800"
                      : equipment.status === "in_use"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {equipment.status.replace("_", " ").charAt(0).toUpperCase() +
                    equipment.status.replace("_", " ").slice(1)}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    equipment.ownership_type === "hall" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {equipment.ownership_type.charAt(0).toUpperCase() + equipment.ownership_type.slice(1)} Owned
                </span>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 sm:ml-auto flex gap-2">
              {canManageStatus() && (
                <button onClick={() => setIsStatusModalOpen(true)} className="btn btn-secondary">
                  <Settings className="mr-1 h-4 w-4" />
                  Manage Status
                </button>
              )}
              {equipment.status === "available" && (
                <button onClick={() => setIsRequestModalOpen(true)} className="btn btn-primary">
                  Request Equipment
                </button>
              )}
            </div>
          </div>

          {/* Show current user if equipment is in use */}
          {equipment.status === "in_use" && currentUser && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <User className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">
                  Currently with:{" "}
                  <Link to={`/members/${currentUser.id}`} className="text-primary-600 hover:text-primary-800">
                    {currentUser.name}
                  </Link>
                </span>
              </div>
            </div>
          )}
        </div>

        {equipment.details && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Details</h2>
            <p className="text-gray-600">{equipment.details}</p>
          </div>
        )}

        {owner && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Owner</h2>
            <div className="flex items-center">
              <div className="bg-primary-100 text-primary-600 rounded-full w-10 h-10 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  <Link to={`/members/${owner.id}`} className="hover:text-primary-600">
                    {owner.name}
                  </Link>
                </p>
                <p className="text-xs text-gray-500">{owner.domain}</p>
              </div>
            </div>
          </div>
        )}

        {accessories.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Accessories & Lenses</h2>
              <button
                onClick={() => setShowAccessories(!showAccessories)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showAccessories ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>

            {showAccessories && (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {accessories.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <Link to={`/equipment/${item.id}`} className="hover:text-primary-600">
                            {item.name}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === "available"
                                ? "bg-green-100 text-green-800"
                                : item.status === "in_use"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status.replace("_", " ").charAt(0).toUpperCase() +
                              item.status.replace("_", " ").slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="p-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipment History</h2>

          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((log) => (
                <div key={log.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="bg-primary-100 text-primary-600 rounded-full p-2 flex-shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        <Link to={`/members/${log.user?.id}`} className="hover:text-primary-600">
                          {log.user?.name}
                        </Link>
                      </p>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(log.checkout_time).toLocaleDateString()}
                        <Clock className="h-3 w-3 ml-3 mr-1" />
                        {new Date(log.checkout_time).toLocaleTimeString()}
                      </div>
                      {log.return_time && (
                        <div className="mt-1 text-xs text-gray-500">
                          Returned: {new Date(log.return_time).toLocaleDateString()}{" "}
                          {new Date(log.return_time).toLocaleTimeString()}
                        </div>
                      )}
                      {!log.return_time && (
                        <div className="mt-1 text-xs text-blue-600 font-medium">Currently in use</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No history</h3>
              <p className="mt-1 text-sm text-gray-500">This equipment hasn't been used yet.</p>
            </div>
          )}
        </div>
      </div>

      {isRequestModalOpen && user && (
        <RequestEquipmentModal
          equipment={equipment}
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          currentUser={user}
        />
      )}

      {isStatusModalOpen && user && (
        <EquipmentStatusModal
          equipment={equipment}
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          onUpdate={handleEquipmentUpdate}
          currentUser={user}
        />
      )}
    </div>
  )
}

export default EquipmentDetailPage
