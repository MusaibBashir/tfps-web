"use client"

import type React from "react"

import { useState, type FormEvent, useEffect } from "react"
import { useSupabase } from "../contexts/SupabaseContext"
import type { User, Equipment } from "../types"

const AddEquipmentForm = () => {
  const { supabase } = useSupabase()
  const [formData, setFormData] = useState({
    name: "",
    type: "camera",
    subtype: "",
    parent_id: "",
    ownership_type: "hall",
    owner_id: "",
    hall: "",
    status: "available",
    image_url: "",
    details: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [users, setUsers] = useState<User[]>([])
  const [cameras, setCameras] = useState<Equipment[]>([])
  const [showParentSelect, setShowParentSelect] = useState(false)
  const [showOwnerSelect, setShowOwnerSelect] = useState(false)
  const [showHallSelect, setShowHallSelect] = useState(false)

  const halls = [
    "LBS",
    "RK",
    "RP",
    "Azad",
    "Patel",
    "Nehru",
    "MMM",
    "VS",
    "MS",
    "LLR",
    "SNVH",
    "MT",
    "SNIG",
  ]

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("users").select("id, name").order("name")

      setUsers(data || [])
    }

    const fetchCameras = async () => {
      const { data } = await supabase.from("equipment").select("*").eq("type", "camera").order("name")

      setCameras(data || [])
    }

    fetchUsers()
    fetchCameras()
  }, [supabase])

  useEffect(() => {
    // parent
    setShowParentSelect(formData.type === "lens")

    // owner
    setShowOwnerSelect(formData.ownership_type === "student")

    // hall
    setShowHallSelect(formData.ownership_type === "hall")

   
    if (!showParentSelect) {
      setFormData((prev) => ({ ...prev, parent_id: "" }))
    }

    if (!showOwnerSelect) {
      setFormData((prev) => ({ ...prev, owner_id: "" }))
    }

    if (!showHallSelect) {
      setFormData((prev) => ({ ...prev, hall: "" }))
    }
  }, [formData.type, formData.ownership_type, showParentSelect, showOwnerSelect, showHallSelect])

  // Auto-populate lens details from parent camera
  useEffect(() => {
    if (formData.parent_id && formData.type === "lens") {
      const parentCamera = cameras.find((camera) => camera.id === formData.parent_id)
      if (parentCamera) {
        setFormData((prev) => ({
          ...prev,
          ownership_type: parentCamera.ownership_type,
          owner_id: parentCamera.owner_id || "",
          hall: parentCamera.hall || "",
        }))
      }
    }
  }, [formData.parent_id, formData.type, cameras])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
  
      const { error } = await supabase.from("equipment").insert({
        name: formData.name,
        type: formData.type,
        subtype: formData.subtype || null,
        parent_id: formData.parent_id || null,
        ownership_type: formData.ownership_type,
        owner_id: formData.owner_id || null,
        hall: formData.hall || null,
        status: formData.status,
        image_url: formData.image_url || null,
        details: formData.details || null,
      })

      if (error) throw error

      setSuccess(true)
      setFormData({
        name: "",
        type: "camera",
        subtype: "",
        parent_id: "",
        ownership_type: "hall",
        owner_id: "",
        hall: "",
        status: "available",
        image_url: "",
        details: "",
      })
    } catch (error) {
      console.error("Error creating equipment:", error)
      setError("Failed to create equipment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="rounded-md bg-green-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Equipment created successfully!</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Equipment Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="input mt-1"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select name="type" id="type" required className="select mt-1" value={formData.type} onChange={handleChange}>
            <option value="camera">Camera</option>
            <option value="lens">Lens</option>
            <option value="tripod">Tripod</option>
            <option value="light">Light</option>
            <option value="audio">Audio</option>
            <option value="other">Other</option>
          </select>
        </div>

        {showParentSelect && (
          <div>
            <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700">
              Parent Camera
            </label>
            <select
              name="parent_id"
              id="parent_id"
              className="select mt-1"
              value={formData.parent_id}
              onChange={handleChange}
            >
              <option value="">Select a camera (optional)</option>
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              If selected, ownership details will be inherited from the parent camera
            </p>
          </div>
        )}

        <div>
          <label htmlFor="subtype" className="block text-sm font-medium text-gray-700">
            Subtype (Optional)
          </label>
          <input
            type="text"
            name="subtype"
            id="subtype"
            className="input mt-1"
            placeholder="e.g., DSLR, Mirrorless, Prime Lens, etc."
            value={formData.subtype}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="ownership_type" className="block text-sm font-medium text-gray-700">
            Ownership Type
          </label>
          <select
            name="ownership_type"
            id="ownership_type"
            required
            className="select mt-1"
            value={formData.ownership_type}
            onChange={handleChange}
            disabled={formData.type === "lens" && formData.parent_id}
          >
            <option value="hall">Hall Owned</option>
            <option value="student">Student Owned</option>
          </select>
          {formData.type === "lens" && formData.parent_id && (
            <p className="text-xs text-gray-500 mt-1">Inherited from parent camera</p>
          )}
        </div>

        {showHallSelect && (
          <div>
            <label htmlFor="hall" className="block text-sm font-medium text-gray-700">
              Hall
            </label>
            <select
              name="hall"
              id="hall"
              required={showHallSelect}
              className="select mt-1"
              value={formData.hall}
              onChange={handleChange}
              disabled={formData.type === "lens" && formData.parent_id}
            >
              <option value="">Select a hall</option>
              {halls.map((hall) => (
                <option key={hall} value={hall}>
                  {hall}
                </option>
              ))}
            </select>
            {formData.type === "lens" && formData.parent_id && (
              <p className="text-xs text-gray-500 mt-1">Inherited from parent camera</p>
            )}
          </div>
        )}

        {showOwnerSelect && (
          <div>
            <label htmlFor="owner_id" className="block text-sm font-medium text-gray-700">
              Owner
            </label>
            <select
              name="owner_id"
              id="owner_id"
              required={showOwnerSelect}
              className="select mt-1"
              value={formData.owner_id}
              onChange={handleChange}
              disabled={formData.type === "lens" && formData.parent_id}
            >
              <option value="">Select an owner</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {formData.type === "lens" && formData.parent_id && (
              <p className="text-xs text-gray-500 mt-1">Inherited from parent camera</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            id="status"
            required
            className="select mt-1"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
            Image URL (Optional)
          </label>
          <input
            type="url"
            name="image_url"
            id="image_url"
            className="input mt-1"
            value={formData.image_url}
            onChange={handleChange}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="details" className="block text-sm font-medium text-gray-700">
            Details (Optional)
          </label>
          <textarea
            name="details"
            id="details"
            rows={3}
            className="input mt-1"
            value={formData.details}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mt-6">
        <button type="submit" disabled={loading} className="btn btn-primary w-full sm:w-auto">
          {loading ? "Creating..." : "Add Equipment"}
        </button>
      </div>
    </form>
  )
}

export default AddEquipmentForm
