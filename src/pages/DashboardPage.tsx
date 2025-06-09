"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Users, Calendar, Package, ClipboardList, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useSupabase } from "../contexts/SupabaseContext"

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

      setRecentActivity(activityResult.data || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={16} className="text-green-500" />
      case "declined":
        return <AlertCircle size={16} className="text-red-500" />
      default:
        return <Clock size={16} className="text-yellow-500" />
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

      {/* Personal Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <div className="dashboard-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">My Equipment Status</h3>
            <TrendingUp size={20} className="text-primary-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-600">Active Requests</span>
              <span className="text-lg sm:text-xl font-bold text-green-600">{stats.myActiveRequests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-600">Pending Requests</span>
              <span className="text-lg sm:text-xl font-bold text-yellow-600">{stats.myPendingRequests}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Link
              to="/equipment"
              className="btn btn-primary text-xs sm:text-sm py-2 px-3 text-center hover:scale-105 transition-transform"
            >
              Browse Equipment
            </Link>
            <Link
              to="/calendar"
              className="btn btn-secondary text-xs sm:text-sm py-2 px-3 text-center hover:scale-105 transition-transform"
            >
              View Calendar
            </Link>
            <Link
              to="/requests"
              className="btn btn-outline text-xs sm:text-sm py-2 px-3 text-center hover:scale-105 transition-transform"
            >
              My Requests
            </Link>
            <Link
              to="/profile"
              className="btn btn-outline text-xs sm:text-sm py-2 px-3 text-center hover:scale-105 transition-transform"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Recent Activity</h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 mb-2 sm:mb-0">
                  {getStatusIcon(activity.status)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-medium text-gray-800 truncate">
                      {activity.equipment?.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">Requested by {activity.requester?.name}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      activity.status,
                    )}`}
                  >
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No recent activity</p>
        )}
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
