"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, Users } from "lucide-react"
import { useSupabase } from "../contexts/SupabaseContext"
import type { User } from "../types"

const MembersPage = () => {
  const { supabase } = useSupabase()
  const [members, setMembers] = useState<User[]>([])
  const [filteredMembers, setFilteredMembers] = useState<User[]>([])
  const [domains, setDomains] = useState<string[]>([])
  const [batches, setBatches] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [selectedHall, setSelectedHall] = useState<string>("all")
  const [selectedBatch, setSelectedBatch] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("all")

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

  const years = [1, 2, 3, 4, 5]

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

          // Extract unique domains and batches
          const uniqueDomains = Array.from(new Set(data.map((user) => user.domain).filter(Boolean)))
          const uniqueBatches = Array.from(new Set(data.map((user) => user.batch).filter(Boolean)))
          setDomains(uniqueDomains)
          setBatches(uniqueBatches)
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
    // Filters
    let filtered = members

    if (searchQuery) {
      filtered = filtered.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (selectedDomain !== "all") {
      filtered = filtered.filter((member) => member.domain === selectedDomain)
    }

    if (selectedHall !== "all") {
      filtered = filtered.filter((member) => member.hostel === selectedHall)
    }

    if (selectedBatch !== "all") {
      filtered = filtered.filter((member) => member.batch === selectedBatch)
    }

    if (selectedYear !== "all") {
      filtered = filtered.filter((member) => member.year === Number.parseInt(selectedYear))
    }

    setFilteredMembers(filtered)
  }, [searchQuery, selectedDomain, selectedHall, selectedBatch, selectedYear, members])

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

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2 relative">
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

        <div>
          <select className="select" value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)}>
            <option value="all">All Domains</option>
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select className="select" value={selectedHall} onChange={(e) => setSelectedHall(e.target.value)}>
            <option value="all">All Halls</option>
            {halls.map((hall) => (
              <option key={hall} value={hall}>
                {hall}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select className="select" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
            <option value="all">All Batches</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select className="select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {getYearSuffix(year)} Year
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <Link
              key={member.id}
              to={`/members/${member.id}`}
              className="card group animate-fade-in hover:shadow-lg transition-shadow"
            >
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
                <div className="mt-3 space-y-1">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{member.hostel}</span> • {getYearSuffix(member.year)} Year
                  </div>
                  {member.batch && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{member.batch}</span>
                    </div>
                  )}
                  {member.branch && <div className="text-xs text-gray-500">{member.branch}</div>}
                </div>
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
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
}

export default MembersPage
