"use client"

import { useState, useEffect, type FormEvent } from "react"
import { User, Lock, Camera, Save, AlertCircle, Film, Instagram, ExternalLink } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useSupabase } from "../contexts/SupabaseContext"
import type { Equipment } from "../types"

const ProfilePage = () => {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userEquipment, setUserEquipment] = useState<Equipment[]>([])
  const [cameras, setCameras] = useState<{ id: string; name: string }[]>([])

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    hostel: user?.hostel || "",
    year: user?.year || 1,
    domain: user?.domain || "Photography",
    favorite_movie: user?.favorite_movie || "",
    instagram_link: user?.instagram_link || "",
    letterboxd_link: user?.letterboxd_link || "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Equipment form state
  const [equipmentForm, setEquipmentForm] = useState({
    name: "",
    type: "camera",
    subtype: "",
    parent_id: "",
    status: "available",
    image_url: "",
    details: "",
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username,
        email: user.email,
        hostel: user.hostel,
        year: user.year,
        domain: user.domain,
        favorite_movie: user.favorite_movie || "",
        instagram_link: user.instagram_link || "",
        letterboxd_link: user.letterboxd_link || "",
      })
      fetchUserEquipment()
      fetchCameras()
    }
  }, [user])

  const fetchUserEquipment = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("owner_id", user.id)
        .eq("ownership_type", "student")
        .order("name")

      if (error) throw error
      setUserEquipment(data || [])
    } catch (error) {
      console.error("Error fetching user equipment:", error)
    }
  }

  const fetchCameras = async () => {
    try {
      // Fetch all cameras (both hall-owned and student-owned) for lens association
      const { data, error } = await supabase
        .from("equipment")
        .select("id, name")
        .eq("type", "camera")
        .order("name")

      if (error) throw error
      setCameras(data || [])
    } catch (error) {
      console.error("Error fetching cameras:", error)
    }
  }

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Check if username is already taken by another user
      if (profileForm.username !== user?.username) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("username", profileForm.username)
          .neq("id", user?.id)
          .single()

        if (existingUser) {
          setError("Username is already taken. Please choose a different username.")
          return
        }
      }

      // Validate Instagram link format if provided
      if (profileForm.instagram_link && !profileForm.instagram_link.includes("instagram.com")) {
        if (!profileForm.instagram_link.startsWith("http")) {
          profileForm.instagram_link = `https://instagram.com/${profileForm.instagram_link.replace("@", "")}`
        }
      }

      // Validate Letterboxd link format if provided
      if (profileForm.letterboxd_link && !profileForm.letterboxd_link.includes("letterboxd.com")) {
        if (!profileForm.letterboxd_link.startsWith("http")) {
          profileForm.letterboxd_link = `https://letterboxd.com/${profileForm.letterboxd_link}`
        }
      }

      const { error } = await supabase
        .from("users")
        .update({
          username: profileForm.username,
          email: profileForm.email,
          hostel: profileForm.hostel,
          year: profileForm.year,
          domain: profileForm.domain,
          favorite_movie: profileForm.favorite_movie || null,
          instagram_link: profileForm.instagram_link || null,
          letterboxd_link: profileForm.letterboxd_link || null,
        })
        .eq("id", user?.id)

      if (error) throw error

      setSuccess("Profile updated successfully!")

      // Update local storage if username changed
      if (profileForm.username !== user?.username) {
        // Force a page reload to update the auth context
        window.location.reload()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.")
      setLoading(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters long.")
      setLoading(false)
      return
    }

    try {
      // Verify current password
      const { data: userData } = await supabase.from("users").select("password").eq("id", user?.id).single()

      if (userData?.password !== passwordForm.currentPassword) {
        setError("Current password is incorrect.")
        return
      }

      // Update password
      const { error } = await supabase.from("users").update({ password: passwordForm.newPassword }).eq("id", user?.id)

      if (error) throw error

      setSuccess("Password updated successfully!")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error updating password:", error)
      setError("Failed to update password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEquipmentSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.from("equipment").insert({
        name: equipmentForm.name,
        type: equipmentForm.type,
        subtype: equipmentForm.subtype || null,
        parent_id: equipmentForm.parent_id || null,
        ownership_type: "student",
        owner_id: user?.id,
        status: equipmentForm.status,
        image_url: equipmentForm.image_url || null,
        details: equipmentForm.details || null,
      })

      if (error) throw error

      setSuccess("Equipment added successfully!")
      setEquipmentForm({
        name: "",
        type: "camera",
        subtype: "",
        parent_id: "",
        status: "available",
        image_url: "",
        details: "",
      })

      // Refresh equipment list
      await fetchUserEquipment()
    } catch (error) {
      console.error("Error adding equipment:", error)
      setError("Failed to add equipment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return

    try {
      const { error } = await supabase.from("equipment").delete().eq("id", equipmentId)

      if (error) throw error

      setSuccess("Equipment deleted successfully!")
      await fetchUserEquipment()
    } catch (error) {
      console.error("Error deleting equipment:", error)
      setError("Failed to delete equipment. Please try again.")
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and equipment</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <User className="mr-2 h-5 w-5" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                activeTab === "password"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Lock className="mr-2 h-5 w-5" />
              Change Password
            </button>
            <button
              onClick={() => setActiveTab("equipment")}
              className={`py-4 px-1 flex items-center border-b-2 font-medium text-sm ${
                activeTab === "equipment"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Camera className="mr-2 h-5 w-5" />
              My Equipment
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {activeTab === "profile" && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="input"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="input"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="hostel" className="block text-sm font-medium text-gray-700 mb-1">
                    Hostel
                  </label>
                  <input
                    type="text"
                    id="hostel"
                    className="input"
                    value={profileForm.hostel}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, hostel: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    id="year"
                    className="select"
                    value={profileForm.year}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, year: Number.parseInt(e.target.value) }))}
                    required
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                    <option value={5}>5th Year</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <select
                    id="domain"
                    className="select"
                    value={profileForm.domain}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, domain: e.target.value }))}
                    required
                  >
                    <option value="Photography">Photography</option>
                    <option value="Cinematography">Cinematography</option>
                    <option value="Editing">Editing</option>
                    <option value="Sound">Sound</option>
                    <option value="Direction">Direction</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="favorite_movie" className="block text-sm font-medium text-gray-700 mb-1">
                    Favorite Movie
                  </label>
                  <div className="flex items-center">
                    <Film className="h-4 w-4 text-gray-400 mr-2" />
                    <input
                      type="text"
                      id="favorite_movie"
                      className="input"
                      value={profileForm.favorite_movie}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, favorite_movie: e.target.value }))}
                      placeholder="e.g., The Godfather"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Social Media Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="instagram_link" className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram Profile
                    </label>
                    <div className="flex items-center">
                      <Instagram className="h-4 w-4 text-pink-500 mr-2" />
                      <input
                        type="text"
                        id="instagram_link"
                        className="input"
                        value={profileForm.instagram_link}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, instagram_link: e.target.value }))}
                        placeholder="@username or full URL"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Enter your Instagram username or full profile URL</p>
                  </div>
                  <div>
                    <label htmlFor="letterboxd_link" className="block text-sm font-medium text-gray-700 mb-1">
                      Letterboxd Profile
                    </label>
                    <div className="flex items-center">
                      <ExternalLink className="h-4 w-4 text-green-600 mr-2" />
                      <input
                        type="text"
                        id="letterboxd_link"
                        className="input"
                        value={profileForm.letterboxd_link}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, letterboxd_link: e.target.value }))}
                        placeholder="username or full URL"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Enter your Letterboxd username or full profile URL</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="btn btn-primary flex items-center">
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "password" && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className="input"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="input"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="input"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="btn btn-primary flex items-center">
                  <Lock className="mr-2 h-4 w-4" />
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "equipment" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">My Equipment</h2>
            </div>

            {/* Add Equipment Form */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-md font-medium text-gray-900 mb-4">Add New Equipment</h3>
              <form onSubmit={handleEquipmentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="equipmentName" className="block text-sm font-medium text-gray-700 mb-1">
                      Equipment Name
                    </label>
                    <input
                      type="text"
                      id="equipmentName"
                      className="input"
                      value={equipmentForm.name}
                      onChange={(e) => setEquipmentForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="equipmentType" className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      id="equipmentType"
                      className="select"
                      value={equipmentForm.type}
                      onChange={(e) => setEquipmentForm((prev) => ({ ...prev, type: e.target.value, parent_id: "" }))}
                      required
                    >
                      <option value="camera">Camera</option>
                      <option value="lens">Lens</option>
                      <option value="tripod">Tripod</option>
                      <option value="light">Light</option>
                      <option value="audio">Audio</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  {/* Parent camera selection for lenses */}
                  {equipmentForm.type === "lens" && (
                    <div>
                      <label htmlFor="parentCamera" className="block text-sm font-medium text-gray-700 mb-1">
                        Associate with Camera (Optional)
                      </label>
                      <select
                        id="parentCamera"
                        className="select"
                        value={equipmentForm.parent_id}
                        onChange={(e) => setEquipmentForm((prev) => ({ ...prev, parent_id: e.target.value }))}
                      >
                        <option value="">No association (standalone lens)</option>
                        {cameras.map((camera) => (
                          <option key={camera.id} value={camera.id}>
                            {camera.name}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Associate this lens with a specific camera or leave unassociated
                      </p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="equipmentSubtype" className="block text-sm font-medium text-gray-700 mb-1">
                      Subtype (Optional)
                    </label>
                    <input
                      type="text"
                      id="equipmentSubtype"
                      className="input"
                      value={equipmentForm.subtype}
                      onChange={(e) => setEquipmentForm((prev) => ({ ...prev, subtype: e.target.value }))}
                      placeholder="e.g., DSLR, Prime Lens, etc."
                    />
                  </div>
                  <div>
                    <label htmlFor="equipmentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="equipmentStatus"
                      className="select"
                      value={equipmentForm.status}
                      onChange={(e) => setEquipmentForm((prev) => ({ ...prev, status: e.target.value }))}
                      required
                    >
                      <option value="available">Available</option>
                      <option value="in_use">In Use</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="equipmentImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="equipmentImageUrl"
                    className="input"
                    value={equipmentForm.image_url}
                    onChange={(e) => setEquipmentForm((prev) => ({ ...prev, image_url: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="equipmentDetails" className="block text-sm font-medium text-gray-700 mb-1">
                    Details (Optional)
                  </label>
                  <textarea
                    id="equipmentDetails"
                    rows={3}
                    className="input"
                    value={equipmentForm.details}
                    onChange={(e) => setEquipmentForm((prev) => ({ ...prev, details: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={loading} className="btn btn-primary flex items-center">
                    <Camera className="mr-2 h-4 w-4" />
                    {loading ? "Adding..." : "Add Equipment"}
                  </button>
                </div>
              </form>
            </div>

            {/* Equipment List */}
            {userEquipment.length > 0 ? (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Association</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {userEquipment.map((item) => {
                      const associatedCamera = cameras.find(camera => camera.id === item.parent_id)
                      return (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {item.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {item.type}
                            {item.subtype && <span className="text-xs text-gray-400 ml-1">({item.subtype})</span>}
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
                              {item.status === "available"
                                ? "Available"
                                : item.status === "in_use"
                                  ? "In Use"
                                  : "Maintenance"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {item.type === "lens" && associatedCamera ? (
                              <span className="text-blue-600 text-xs">
                                Associated with {associatedCamera.name}
                              </span>
                            ) : item.type === "lens" ? (
                              <span className="text-gray-400 text-xs">Standalone lens</span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <button
                              onClick={() => handleDeleteEquipment(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No equipment added</h3>
                <p className="mt-1 text-sm text-gray-500">Add your personal equipment to share with the community.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
