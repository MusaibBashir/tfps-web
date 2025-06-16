"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Package, Search, Camera, Lightbulb, Mic, Plus, User, Building2 } from "lucide-react"
import { useSupabase } from "../contexts/SupabaseContext"
import { useAuth } from "../contexts/AuthContext"
import type { Equipment } from "../types"

const EquipmentPage = () => {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedOwnership, setSelectedOwnership] = useState<string>("all")
  const [selectedHall, setSelectedHall] = useState<string>("all")

  const halls = [
    "LBS",
    "RP",
    "RK",
    "Azad",
    "Patel",
    "Nehru",
    "MMM",
    "LLR",
    "MS",
    "VS",
    "SNVH",
    "IGH",
    "MT",
  ]

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        let query = supabase.from("equipment").select(`
          *,
          owner:users(name, hostel, batch, year, domain)
        `)

        // Filter based on selected type
        if (selectedType === "lens") {
          // Show ALL lenses
          query = query.eq("type", "lens")
        } else {
          query = query.is("parent_id", null)
        }

        const { data, error } = await query.order("name")

        if (error) {
          throw error
        }

        if (data) {
          setEquipment(data)
          setFilteredEquipment(data)
        }
      } catch (error) {
        console.error("Error fetching equipment:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEquipment()
  }, [supabase, selectedType])

  useEffect(() => {
    // Filter equipment 
    let filtered = equipment

    if (searchQuery) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((item) => item.status === selectedStatus)
    }

    if (selectedOwnership !== "all") {
      filtered = filtered.filter((item) => item.ownership_type === selectedOwnership)
    }

    if (selectedHall !== "all") {
      filtered = filtered.filter((item) => {
        if (item.ownership_type === "hall") {
          return item.hall === selectedHall
        } else if (item.ownership_type === "student" && item.owner) {
          return item.owner.hostel === selectedHall
        }
        return false
      })
    }

    setFilteredEquipment(filtered)
  }, [searchQuery, selectedStatus, selectedOwnership, selectedHall, equipment])

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case "camera":
        return <Camera className="h-5 w-5" />
      case "light":
        return <Lightbulb className="h-5 w-5" />
      case "audio":
        return <Mic className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-50"
      case "in_use":
        return "text-yellow-600 bg-yellow-50"
      case "maintenance":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Available"
      case "in_use":
        return "In Use"
      case "maintenance":
        return "Damaged"
      default:
        return status
    }
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment</h1>
          <p className="text-gray-600 mt-2">Browse and manage all available equipment</p>
        </div>
        {user?.is_admin && (
          <div className="mt-4 sm:mt-0">
            <Link to="/admin?tab=equipment" className="btn btn-primary flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              Add Equipment
            </Link>
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <select className="select" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="camera">Cameras</option>
            <option value="lens">Lenses</option>
            <option value="tripod">Tripods</option>
            <option value="light">Lights</option>
            <option value="audio">Audio</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <select className="select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Damaged</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select className="select" value={selectedOwnership} onChange={(e) => setSelectedOwnership(e.target.value)}>
            <option value="all">All Ownership</option>
            <option value="hall">Hall Owned</option>
            <option value="student">Student Owned</option>
          </select>

          <select className="select" value={selectedHall} onChange={(e) => setSelectedHall(e.target.value)}>
            <option value="all">All Halls</option>
            {halls.map((hall) => (
              <option key={hall} value={hall}>
                {hall}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Show info message when viewing lenses */}
      {selectedType === "lens" && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                Showing all lenses. Lenses associated with cameras can also be viewed by clicking on the camera in the
                equipment list.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show info message when filtering by hall */}
      {selectedHall !== "all" && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                Showing equipment from {selectedHall} hall (including hall-owned equipment and student-owned equipment
                from {selectedHall} residents).
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <Link
              key={item.id}
              to={`/equipment/${item.id}`}
              className="card group animate-fade-in hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(item.status)}`}>{getEquipmentIcon(item.type)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        {item.parent_id && <span className="text-xs text-blue-600 ml-1">(Lens)</span>}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === "available"
                        ? "bg-green-100 text-green-800"
                        : item.status === "in_use"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {getStatusText(item.status)}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Ownership Information */}
                  <div className="flex items-center space-x-2">
                    {item.ownership_type === "hall" ? (
                      <Building2 className="h-4 w-4 text-blue-500" />
                    ) : (
                      <User className="h-4 w-4 text-purple-500" />
                    )}
                    <div className="flex-1">
                      {item.ownership_type === "hall" ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.hall} Hall</p>
                          <p className="text-xs text-gray-500">Hall Owned</p>
                        </div>
                      ) : item.owner ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.owner.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.owner.hostel} • {item.owner.batch || `${item.owner.year}th Year`} •{" "}
                            {item.owner.domain}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Student Owned</p>
                          <p className="text-xs text-gray-500">Owner details not available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Details */}
                  {item.details && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600 line-clamp-2">{item.details}</p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No equipment found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search query.</p>
          {user?.is_admin && (
            <div className="mt-6">
              <Link
                to="/admin?tab=equipment"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                Add New Equipment
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EquipmentPage
