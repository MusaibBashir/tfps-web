"use client"

import type React from "react"
import { User } from "lucide-react" // Import User component

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Users, Calendar, Package, ClipboardList, MapPin, Clock, UserPlus, Edit3 } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useSupabase } from "../contexts/SupabaseContext"
import type { Event } from "../types"
import { formatToIST, getCurrentIST } from "../utils/timezone"

const DashboardPage = () => {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalEquipment: 0,
    pendingRequests: 0,
    upcomingEvents: 0,
    myActiveRequests: 0,
    myPendingRequests: 0,
  })
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch basic stats
      const [membersResult, equipmentResult, requestsResult, eventsResult] = await Promise.all([
        supabase.from("users").select("id", { count: "exact" }),
        supabase.from("equipment").select("id", { count: "exact" }),
        supabase.from("equipment_requests").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("events").select("id", { count: "exact" }).gte("start_time", new Date().toISOString()),
      ])

      // Fetch user-specific stats
      const [myActiveResult, myPendingResult] = await Promise.all([
        supabase
          .from("equipment_requests")
          .select("id", { count: "exact" })
          .eq("requester_id", user?.id)
          .eq("status", "approved"),
        supabase
          .from("equipment_requests")
          .select("id", { count: "exact" })
          .eq("requester_id", user?.id)
          .eq("status", "pending"),
      ])

      // Fetch upcoming events with creator info and participants
      const upcomingEventsResult = await supabase
        .from("events")
        .select(
          `
          *,
          creator:created_by (id, name),
          event_participants (user_id)
        `,
        )
        .gte("start_time", getCurrentIST().toISOString())
        .order("start_time", { ascending: true })
        .limit(6)

      // Fetch recent activity
      const activityResult = await supabase
        .from("equipment_requests")
        .select(
          `
          *,
          equipment:equipment_id (name),
          requester:requester_id (name)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(5)

      setStats({
        totalMembers: membersResult.count || 0,
        totalEquipment: equipmentResult.count || 0,
        pendingRequests: requestsResult.count || 0,
        upcomingEvents: eventsResult.count || 0,
        myActiveRequests: myActiveResult.count || 0,
        myPendingRequests: myPendingResult.count || 0,
      })

      setUpcomingEvents(upcomingEventsResult.data || [])
      setRecentActivity(activityResult.data || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.from("event_participants").insert({
        event_id: eventId,
        user_id: user?.id,
        role: "participant",
      })

      if (error && error.code !== "23505") {
        // 23505 is unique constraint violation (already joined)
        console.error("Error joining event:", error)
        throw error
      }

      // Refresh events to show updated participant count
      await fetchDashboardData()
    } catch (error) {
      console.error("Error joining event:", error)
    }
  }

  const handleLeaveEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user?.id)

      if (error) throw error

      // Refresh events to show updated participant count
      await fetchDashboardData()
    } catch (error) {
      console.error("Error leaving event:", error)
    }
  }

  const isUserJoined = (event: Event) => {
    return event.event_participants?.some((p: any) => p.user_id === user?.id) || false
  }

  const canEditEvent = (event: Event) => {
    return event.created_by === user?.id || user?.is_admin
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case "declined":
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      default:
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "declined":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="dashboard-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Here's what's happening with your equipment and events.
            </p>
          </div>
          {user?.is_admin && (
            <div className="mt-4 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-orange text-white shadow-lg">
                Admin Access
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon={<Users size={20} className="sm:w-6 sm:h-6" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          link="/members"
        />
        <StatCard
          title="Equipment"
          value={stats.totalEquipment}
          icon={<Package size={20} className="sm:w-6 sm:h-6" />}
          color="bg-gradient-to-br from-green-500 to-green-600"
          link="/equipment"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={<ClipboardList size={20} className="sm:w-6 sm:h-6" />}
          color="bg-gradient-to-br from-yellow-500 to-orange-500"
          link="/requests"
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          icon={<Calendar size={20} className="sm:w-6 sm:h-6" />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          link="/calendar"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Upcoming Events - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="dashboard-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Upcoming Events</h3>
              <Link to="/calendar" className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                View All →
              </Link>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              event.event_type === "shoot"
                                ? "bg-blue-100 text-blue-800"
                                : event.event_type === "screening"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {event.event_type}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            <span>
                              {formatToIST(event.start_time, "MMM d, yyyy")} at{" "}
                              {formatToIST(event.start_time, "h:mm a")}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin size={14} />
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users size={14} />
                            <span>
                              {event.event_participants?.length || 0} participant
                              {(event.event_participants?.length || 0) !== 1 ? "s" : ""}
                            </span>
                          </div>
                          {event.creator && (
                            <div className="flex items-center gap-2">
                              <User size={14} /> {/* Use User component */}
                              <span>Created by {event.creator.name}</span>
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-shrink-0">
                        {canEditEvent(event) ? (
                          <Link
                            to={`/calendar?edit=${event.id}`}
                            className="btn btn-outline text-xs px-3 py-1 flex items-center gap-1"
                          >
                            <Edit3 size={12} />
                            Edit
                          </Link>
                        ) : event.is_open ? (
                          isUserJoined(event) ? (
                            <button
                              onClick={() => handleLeaveEvent(event.id)}
                              className="btn btn-secondary text-xs px-3 py-1"
                            >
                              Leave
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinEvent(event.id)}
                              className="btn btn-primary text-xs px-3 py-1 flex items-center gap-1"
                            >
                              <UserPlus size={12} />
                              Join
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-gray-500 px-3 py-1">Private Event</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h4>
                <p className="text-gray-600 mb-4">There are no events scheduled in the near future.</p>
                <Link to="/calendar" className="btn btn-primary">
                  Create Event
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* My Status - Takes 1 column */}
        <div className="space-y-6">
          {/* Personal Stats */}
          <div className="dashboard-card p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">My Equipment Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Requests</span>
                <span className="text-lg font-bold text-green-600">{stats.myActiveRequests}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Requests</span>
                <span className="text-lg font-bold text-yellow-600">{stats.myPendingRequests}</span>
              </div>
              <div className="pt-3 border-t">
                <Link to="/requests" className="btn btn-primary w-full text-sm">
                  View My Requests
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="mt-2">{getStatusIcon(activity.status)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{activity.equipment?.name}</p>
                      <p className="text-xs text-gray-600">by {activity.requester?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            activity.status,
                          )}`}
                        >
                          {activity.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  link: string
}

const StatCard = ({ title, value, icon, color, link }: StatCardProps) => (
  <Link to={link} className="group">
    <div className="dashboard-card p-4 sm:p-6 group-hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color} text-white shadow-lg`}>{icon}</div>
      </div>
    </div>
  </Link>
)

export default DashboardPage
