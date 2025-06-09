"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, Package, ClipboardList, AlertTriangle } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useSupabase } from "../contexts/SupabaseContext"
import type { Event, Equipment, EquipmentRequest } from "../types"

const DashboardPage = () => {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [events, setEvents] = useState<Event[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [requests, setRequests] = useState<EquipmentRequest[]>([])
  const [damageReports, setDamageReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Fetch upcoming events
        const { data: eventsData } = await supabase
          .from("events")
          .select("*")
          .gte("start_time", new Date().toISOString())
          .order("start_time", { ascending: true })
          .limit(5)

        // Fetch available equipment
        const { data: equipmentData } = await supabase
          .from("equipment")
          .select("*")
          .eq("status", "available")
          .is("parent_id", null)
          .limit(5)

        // Fetch pending requests
        const { data: requestsData, error: requestsError } = await supabase
          .from("equipment_requests")
          .select(`
            id,
            equipment_id,
            event_id,
            requester_id,
            status,
            approved_by,
            notes,
            created_at,
            equipment:equipment_id(*)
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5)

        if (requestsError) {
          console.error("Error fetching requests:", requestsError)
          throw requestsError
        }

        // Fetch requesters for the requests
        if (requestsData && requestsData.length > 0) {
          const requesterIds = requestsData.map((req) => req.requester_id).filter(Boolean)

          if (requesterIds.length > 0) {
            const { data: requestersData } = await supabase.from("users").select("id, name").in("id", requesterIds)

            // Fetch events for requests that have event_id
            const eventIds = requestsData.filter((req) => req.event_id).map((req) => req.event_id)

            let eventsForRequests = []
            if (eventIds.length > 0) {
              const { data: eventsData } = await supabase.from("events").select("id, title").in("id", eventIds)

              eventsForRequests = eventsData || []
            }

            // Combine all data
            const enrichedRequests = requestsData.map((req) => ({
              ...req,
              requester: requestersData?.find((u) => u.id === req.requester_id) || null,
              events: req.event_id ? eventsForRequests.find((e) => e.id === req.event_id) : null,
            }))

            setRequests(enrichedRequests)
          } else {
            setRequests(requestsData)
          }
        } else {
          setRequests([])
        }

        // Fetch recent damage reports for equipment owner/admin
        let damageQuery = supabase
          .from("damage_reports")
          .select(`
            *,
            equipment(*),
            reporter:reported_by(*)
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        if (!user?.is_admin) {
          // Non-admin users only see damage reports for their equipment
          damageQuery = damageQuery.eq("equipment.owner_id", user?.id)
        }

        const { data: damageData } = await damageQuery

        setDamageReports(damageData || [])
        setEvents(eventsData || [])
        setEquipment(equipmentData || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase, user])

  if (!user) return null

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}</h1>
        <p className="text-gray-600 mt-2">Your photography club portal for managing equipment, events, and more.</p>
      </div>

      {/* Damage Reports Alert */}
      {damageReports.length > 0 && (
        <div className="mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Recent Damage Reports</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {damageReports.slice(0, 3).map((report) => (
                      <li key={report.id}>
                        <span className="font-medium">{report.equipment?.name}</span> - {report.damage_description}
                        <span className="text-xs text-red-600 ml-2">
                          Reported by {report.reporter?.name} on {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {damageReports.length > 3 && (
                    <p className="mt-2 text-xs">And {damageReports.length - 3} more damage reports...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <DashboardCard
          icon={<CalendarDays className="h-7 w-7 text-white" />}
          title="Upcoming Events"
          count={events.length}
          viewAllLink="/calendar"
          bgColor="bg-blue-50"
        />
        <DashboardCard
          icon={<Package className="h-7 w-7 text-white" />}
          title="Available Equipment"
          count={equipment.length}
          viewAllLink="/equipment"
          bgColor="bg-green-50"
        />
        <DashboardCard
          icon={<ClipboardList className="h-7 w-7 text-white" />}
          title="Pending Requests"
          count={requests.length}
          viewAllLink="/requests"
          bgColor="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
            <Link to="/calendar" className="text-sm text-primary-600 hover:text-primary-800">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="dashboard-card p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-2"></div>
              <p className="text-gray-500">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="dashboard-card">
              <ul className="divide-y divide-orange-100">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="p-4 hover:bg-gradient-orange-light hover:bg-opacity-20 transition-all duration-300"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.location}</p>
                      </div>
                      <div className="text-sm text-gray-500 font-medium">
                        {new Date(event.start_time).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${
                          event.event_type === "shoot"
                            ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white"
                            : event.event_type === "screening"
                              ? "bg-gradient-to-r from-purple-400 to-purple-500 text-white"
                              : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                        }`}
                      >
                        {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="dashboard-card p-8 text-center">
              <CalendarDays className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming events</h3>
              <p className="text-gray-600 mb-6">There are no events scheduled in the near future.</p>
              <Link to="/calendar" className="btn btn-primary inline-flex items-center">
                Create an event
              </Link>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Requests</h2>
            <Link to="/requests" className="text-sm text-primary-600 hover:text-primary-800">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-2"></div>
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : requests.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <li key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{request.equipment?.name}</h3>
                        <p className="text-sm text-gray-500">For: {request.events?.title || "General use"}</p>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                    </div>
                    {request.requester && (
                      <div className="mt-1 text-xs text-gray-500">Requested by: {request.requester.name}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No pending requests</h3>
              <p className="text-gray-500 mb-4">There are no equipment requests waiting for approval.</p>
              <Link
                to="/equipment"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Browse equipment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface DashboardCardProps {
  icon: React.ReactNode
  title: string
  count: number
  viewAllLink: string
  bgColor: string
}

const DashboardCard = ({ icon, title, count, viewAllLink, bgColor }: DashboardCardProps) => {
  return (
    <div className="dashboard-card group">
      <div className="p-6 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-orange opacity-10 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500"></div>

        <div className="flex items-center relative z-10">
          <div className="flex-shrink-0 p-3 bg-gradient-orange rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-600 truncate group-hover:text-gray-700 transition-colors">
                {title}
              </dt>
              <dd>
                <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  {count}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
        <div className="text-sm">
          <Link
            to={viewAllLink}
            className="font-medium text-white hover:text-orange-100 transition-colors duration-300 flex items-center group"
          >
            View all
            <span className="ml-1 group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
