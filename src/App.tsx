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
    if (loading) return // Don't do anything while loading

    const isPublicRoute = location.pathname === "/" || location.pathname === "/login"
    const isProtectedRoute = !isPublicRoute

    // If user is not authenticated and trying to access protected routes
    if (!user && isProtectedRoute) {
      navigate("/", { replace: true })
      return
    }

    // If user is authenticated and on public routes, redirect to dashboard
    if (user && isPublicRoute) {
      navigate("/dashboard", { replace: true })
      return
    }
  }, [user, loading, navigate, location.pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-700 font-medium">Loading TFPS...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes - only accessible when not logged in */}
      {!user && (
        <>
          <Route path="/\" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
        </>
      )}

      {/* Protected routes - only accessible when logged in */}
      {user && (
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
      )}

      {/* Fallback route */}
      <Route 
        path="*" 
        element={
          <Navigate 
            to={user ? "/dashboard" : "/"} 
            replace 
          />
        } 
      />
    </Routes>
  )
}

export default App
