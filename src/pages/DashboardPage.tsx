"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, Package, ClipboardList } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useSupabase } from "../contexts/SupabaseContext"
import type { Event, Equipment, EquipmentRequest } from "../types"

const DashboardPage = () => {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [events, setEvents] = useState<Event[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [requests, setRequests] = useState<EquipmentRequest[]>([])
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

        // Fetch pending requests with manual joins
        const { data: requestsData } = await supabase
          .from("equipment_requests")
          .select(`
            *,
            equipment:equipment_id(*),
            requester:requester_id(*)
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(5)

        // Fetch events separately for requests that have event_id
        if (requestsData && requestsData.length > 0) {
          const eventIds = requestsData.filter((req) => req.event_id).map((req) => req.event_id)

          if (eventIds.length > 0) {
            const { data: eventsForRequests } = await supabase.from("events").select("*").in("id", eventIds)

            // Manually attach events to requests
            const requestsWithEvents = requestsData.map((req) => ({
              ...req,
              events: req.event_id ? eventsForRequests?.find((e) => e.id === req.event_id) : null,
            }))

            setRequests(requestsWithEvents)
          } else {
            setRequests(requestsData)
          }
        } else {
          setRequests([])
        }

        setEvents(eventsData || [])
        setEquipment(equipmentData || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  if (!user) return null

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}</h1>
        <p className="text-gray-600 mt-2">Your photography club portal for managing equipment, events, and more.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <DashboardCard
          icon={<CalendarDays className="h-6 w-6 text-primary-500" />}
          title="Upcoming Events"
          count={events.length}
          viewAllLink="/calendar"
          bgColor="bg-blue-50"
        />
        <DashboardCard
          icon={<Package className="h-6 w-6 text-green-500" />}
          title="Available Equipment"
          count={equipment.length}
          viewAllLink="/equipment"
          bgColor="bg-green-50"
        />
        <DashboardCard
          icon={<ClipboardList className="h-6 w-6 text-amber-500" />}
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
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-2"></div>
              <p className="text-gray-500">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {events.map((event) => (
                  <li key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-500">{event.location}</p>
                      </div>
                      <div className="text-sm text-gray-500">{new Date(event.start_time).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          event.event_type === "shoot"
                            ? "bg-blue-100 text-blue-800"
                            : event.event_type === "screening"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
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
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming events</h3>
              <p className="text-gray-500 mb-4">There are no events scheduled in the near future.</p>
              <Link
                to="/calendar"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
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
    <div className={`${bgColor} rounded-lg shadow-sm overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{count}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-white px-5 py-3">
        <div className="text-sm">
          <Link to={viewAllLink} className="font-medium text-primary-600 hover:text-primary-800">
            View all
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
