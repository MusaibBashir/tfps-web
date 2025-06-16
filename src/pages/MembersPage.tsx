"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { useSupabase } from "../contexts/SupabaseContext"
import type { User } from "../types"

const MembersPage = () => {
  const { supabase } = useSupabase()
  const [members, setMembers] = useState<User[]>([])
  const [filteredMembers, setFilteredMembers] = useState<User[]>([])
  const [domains, setDomains] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("All Domains")

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase.from("users").select("*").order("name")

        if (error) {
          throw error
        }

        if (data) {
          setMembers(data)
          setFilteredMembers(data)

          const uniqueDomains = Array.from(new Set(data.map((user) => user.domain)))
          setDomains(uniqueDomains)
        }
      } catch (error) {
        console.error("Error fetching members:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [supabase])

  useEffect(() => {
    // Filter members based on search query and selected domain
    let filtered = members

    if (searchQuery) {
      filtered = filtered.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (selectedDomain !== "All Domains") {
      filtered = filtered.filter((member) => member.domain === selectedDomain)
    }

    setFilteredMembers(filtered)
  }, [searchQuery, selectedDomain, members])

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const getYearSuffix = (year: number) => {
    if (year === 1) return "1st"
    if (year === 2) return "2nd"
    if (year === 3) return "3rd"
    if (year === 4) return "4th"
    if (year === 5) return "5th"
    return `${year}th`
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Members Directory</h1>
        <p className="text-gray-600 mt-2">Browse through all club members and their specializations</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select className="select" value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)}>
            <option>All Domains</option>
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <Link key={member.id} to={`/members/${member.id}`} className="card group animate-fade-in">
              <div className="p-4 bg-primary-50 flex justify-center">
                <div className="avatar h-20 w-20 text-xl">{getInitial(member.name)}</div>
              </div>
              <div className="p-4">
                <div className="flex flex-col items-start">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-600">{member.domain}</p>
                  {member.is_admin && (
                    <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      Admin
                    </span>
                  )}
                </div>
                <div className="mt-3 text-sm text-gray-500">{getYearSuffix(member.year)} Year</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Search className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No members found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
}

export default MembersPage
