"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useSupabase } from "../contexts/SupabaseContext"
import { Camera, Mail, Calendar, User, MapPin, Film, Instagram, ExternalLink } from "lucide-react"
import type { Equipment } from "../types"

interface Member {
  id: string
  name: string
  username: string
  email: string
  hostel: string
  year: number
  domain: string
  favorite_movie?: string
  instagram_link?: string
  letterboxd_link?: string
  created_at: string
}

const MemberDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { supabase } = useSupabase()
  const [member, setMember] = useState<Member | null>(null)
  const [memberEquipment, setMemberEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

        if (error) throw error
        setMember(data)

        // Fetch member's equipment
        const { data: equipmentData, error: equipmentError } = await supabase
          .from("equipment")
          .select("*")
          .eq("owner_id", id)
          .eq("ownership_type", "student")
          .order("name")

        if (equipmentError) throw equipmentError
        setMemberEquipment(equipmentData || [])
      } catch (err) {
        console.error("Error fetching member:", err)
        setError("Failed to load member details.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMember()
    }
  }, [id, supabase])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600">{error || "Member not found."}</p>
        <Link to="/members" className="mt-4 inline-block text-primary-600 hover:underline">
          Back to Members
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-6">
        <Link to="/members" className="text-primary-600 hover:underline flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Members
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
              <p className="text-gray-600 mt-1">@{member.username}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800`}
              >
                {member.domain}
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Member Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-gray-900">{member.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hostel</p>
                    <p className="text-gray-900">{member.hostel}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Year</p>
                    <p className="text-gray-900">
                      {member.year}
                      {getOrdinalSuffix(member.year)} Year
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p className="text-gray-900">{new Date(member.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {member.favorite_movie && (
                  <div className="flex items-center">
                    <Film className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Favorite Movie</p>
                      <p className="text-gray-900">{member.favorite_movie}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              {(member.instagram_link || member.letterboxd_link) && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Social Media</h3>
                  <div className="flex flex-wrap gap-3">
                    {member.instagram_link && (
                      <a
                        href={member.instagram_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-1.5 bg-pink-50 text-pink-700 rounded-md hover:bg-pink-100 transition-colors"
                      >
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </a>
                    )}
                    {member.letterboxd_link && (
                      <a
                        href={member.letterboxd_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Letterboxd
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Equipment</h2>
              {memberEquipment.length > 0 ? (
                <div className="space-y-3">
                  {memberEquipment.map((item) => (
                    <div key={item.id} className="flex items-start p-3 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0 bg-gray-100 p-2 rounded-md">
                        <Camera className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {item.type}
                            {item.subtype && ` • ${item.subtype}`}
                          </span>
                          <span
                            className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
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
                        </div>
                        {item.details && <p className="mt-1 text-xs text-gray-600">{item.details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Camera className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No equipment added by this member.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get ordinal suffix for numbers
function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100
  if (j === 1 && k !== 11) {
    return "st"
  }
  if (j === 2 && k !== 12) {
    return "nd"
  }
  if (j === 3 && k !== 13) {
    return "rd"
  }
  return "th"
}

export default MemberDetailPage
