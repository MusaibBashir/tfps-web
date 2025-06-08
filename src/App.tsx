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

  useEffect(() => {
    // Only redirect to login if user is trying to access protected routes without authentication
    if (
      !loading &&
      !user &&
      location.pathname !== "/home" &&
      location.pathname !== "/login" &&
      location.pathname !== "/"
    ) {
      navigate("/login")
    }
  }, [user, loading, navigate, location.pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
