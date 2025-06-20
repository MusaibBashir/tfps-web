"use client"

import { useState } from "react"
import { Camera, Package, Lightbulb, Mic, Plus, AlertCircle } from "lucide-react"
import { useSupabase } from "../contexts/SupabaseContext"
import { useAuth } from "../contexts/AuthContext"

const AddEquipmentForm = () => {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    type: "camera",
    description: "",
    ownership_type: "hall",
    hall: "",
    owner_id: "",
    status: "available"
  })

  const halls = [
    "LBS", "RK", "RP", "Azad", "Patel", "Nehru", "MMM", 
    "VS", "MS", "LLR", "SNVH", "MT", "SNIG"
  ]

  const equipmentTypes = [
    { value: "camera", label: "Camera", icon: Camera },
    { value: "lens", label: "Lens", icon: Package },
    { value: "tripod", label: "Tripod", icon: Package },
    { value: "light", label: "Light", icon: Lightbulb },
    { value: "audio", label: "Audio", icon: Mic },
    { value: "other", label: "Other", icon: Package }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Equipment name is required")
      }

      if (formData.ownership_type === "hall" && !formData.hall) {
        throw new Error("Hall selection is required for hall-owned equipment")
      }

      if (formData.ownership_type === "student" && !formData.owner_id) {
        throw new Error("Owner selection is required for student-owned equipment")
      }

      // Prepare data for insertion
      const equipmentData = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || null,
        ownership_type: formData.ownership_type,
        hall: formData.ownership_type === "hall" ? formData.hall : null,
        owner_id: formData.ownership_type === "student" ? formData.owner_id : null,
        status: formData.status,
        created_by: user?.id
      }

      const { error: insertError } = await supabase
        .from("equipment")
        .insert([equipmentData])

      if (insertError) {
        throw insertError
      }

      setSuccess(true)
      setFormData({
        name: "",
        type: "camera",
        description: "",
        ownership_type: "hall",
        hall: "",
        owner_id: "",
        status: "available"
      })

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)

    } catch (err: any) {
      console.error("Error adding equipment:", err)
      setError(err.message || "Failed to add equipment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getEquipmentIcon = (type: string) => {
    const equipmentType = equipmentTypes.find(t => t.value === type)
    const IconComponent = equipmentType?.icon || Package
    return <IconComponent className="h-5 w-5" />
  }

  return (
    <div className="max-w-2xl mx-auto">
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                Equipment added successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Equipment Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Equipment Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="input"
            placeholder="e.g., Canon EOS R5, Sony 24-70mm f/2.8"
            required
          />
        </div>

        {/* Equipment Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Equipment Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="select"
            required
          >
            {equipmentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="input"
            placeholder="Additional details about the equipment..."
          />
        </div>

        {/* Ownership Type */}
        <div>
          <label htmlFor="ownership_type" className="block text-sm font-medium text-gray-700 mb-2">
            Ownership Type *
          </label>
          <select
            id="ownership_type"
            name="ownership_type"
            value={formData.ownership_type}
            onChange={handleInputChange}
            className="select"
            required
          >
            <option value="hall">Hall Owned</option>
            <option value="student">Student Owned</option>
          </select>
        </div>

        {/* Hall Selection (for hall-owned equipment) */}
        {formData.ownership_type === "hall" && (
          <div>
            <label htmlFor="hall" className="block text-sm font-medium text-gray-700 mb-2">
              Hall *
            </label>
            <select
              id="hall"
              name="hall"
              value={formData.hall}
              onChange={handleInputChange}
              className="select"
              required
            >
              <option value="">Select a hall</option>
              {halls.map((hall) => (
                <option key={hall} value={hall}>
                  {hall}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Owner ID (for student-owned equipment) */}
        {formData.ownership_type === "student" && (
          <div>
            <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700 mb-2">
              Owner User ID *
            </label>
            <input
              type="text"
              id="owner_id"
              name="owner_id"
              value={formData.owner_id}
              onChange={handleInputChange}
              className="input"
              placeholder="Enter the user ID of the equipment owner"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              You can find the user ID in the Users section of the admin panel
            </p>
          </div>
        )}

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Initial Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="select"
            required
          >
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance/Damaged</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Equipment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddEquipmentForm
