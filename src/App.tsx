"use client"

import { useEffect } from "react"
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import MembersPage from "./pages/MembersPage"
import MemberDetailPage from "./pages/MemberDetailPage"
import CalendarPage from "./pages/CalendarPage"
import EquipmentPage from "./pages/EquipmentPage"
import EquipmentDetailPage from "./pages/EquipmentDetailPage"
import AdminPage from "./pages/AdminPage"
import Layout from "./components/Layout"
import RequestsPage from "./pages/RequestsPage"
import HomePage from "./pages/HomePage"
import ProfilePage from "./pages/ProfilePage"

function App() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // List of protected routes
  const protectedRoutes = ["/dashboard", "/profile", "/members", "/calendar", "/equipment", "/requests", "/admin"]

  const isProtectedRoute = (pathname: string) => {
    return protectedRoutes.some((route) => pathname.startsWith(route))
  }

  useEffect(() => {
    if (loading) return

    // If user is logged in
    if (user) {
      // If on root path or home, redirect to dashboard
      if (location.pathname === "/" || location.pathname === "/home") {
        navigate("/dashboard", { replace: true })
        return
      }
      // If on login page, redirect to dashboard
      if (location.pathname === "/login") {
        navigate("/dashboard", { replace: true })
        return
      }
      // Allow navigation to all other protected routes
    } else {
      // User is not logged in
      // If trying to access protected routes, redirect to login
      if (isProtectedRoute(location.pathname)) {
        navigate("/login", { replace: true })
        return
      }
      // If on root path, show homepage (don't redirect)
      // If on /home, show homepage (don't redirect)
      // If on /login, show login page (don't redirect)
    }
  }, [user, loading, navigate, location.pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/members/:id" element={<MemberDetailPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/\" replace />} />
    </Routes>
  )
}

export default App
