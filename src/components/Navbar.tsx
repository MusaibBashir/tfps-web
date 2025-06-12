"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Camera, Users, Calendar, Package, LogOut, User, ClipboardList, Menu, X } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
      // Fallback navigation
      navigate("/login")
    }
  }

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  if (!user) return null

  return (
    <header className="navbar-gradient text-white shadow-2xl relative overflow-hidden sticky top-0 z-50">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent animate-pulse"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold hover:scale-105 transition-transform duration-300"
            onClick={closeMobileMenu}
          >
            <div className="p-1.5 sm:p-2 bg-gradient-orange rounded-lg shadow-lg">
              <Camera size={20} className="sm:hidden text-white" />
              <Camera size={28} className="hidden sm:block text-white" />
            </div>
            <span className="gradient-text bg-gradient-to-r from-orange-300 to-orange-100 bg-clip-text text-transparent">
              TFPS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <NavLink to="/profile" active={location.pathname.startsWith("/profile")}>
              <User size={18} className="mr-2" />
              Profile
            </NavLink>
            <NavLink to="/members" active={location.pathname.startsWith("/members")}>
              <Users size={18} className="mr-2" />
              Members
            </NavLink>
            <NavLink to="/calendar" active={location.pathname.startsWith("/calendar")}>
              <Calendar size={18} className="mr-2" />
              Calendar
            </NavLink>
            <NavLink to="/equipment" active={location.pathname.startsWith("/equipment")}>
              <Package size={18} className="mr-2" />
              Equipment
            </NavLink>
            <NavLink to="/requests" active={location.pathname.startsWith("/requests")}>
              <ClipboardList size={18} className="mr-2" />
              Requests
            </NavLink>
            {user.is_admin && (
              <NavLink to="/admin" active={location.pathname.startsWith("/admin")}>
                <User size={18} className="mr-2" />
                Admin
              </NavLink>
            )}
          </nav>

          {/* User Info and Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 bg-black/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 backdrop-blur-sm">
              <div className="avatar h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm shadow-lg">{getInitial(user.name)}</div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-orange-100 truncate max-w-24 lg:max-w-none">{user.name}</div>
                {user.is_admin && <div className="text-xs text-orange-300 font-semibold">Admin</div>}
              </div>
            </div>

            {/* Desktop Logout */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-orange-100 hover:text-white bg-red-600/80 hover:bg-red-600 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-orange-400/30 py-3 bg-black/20 backdrop-blur-sm rounded-b-lg">
            <div className="flex flex-col space-y-2">
              <MobileNavLink to="/profile" active={location.pathname.startsWith("/profile")} onClick={closeMobileMenu}>
                <User size={18} className="mr-3" />
                Profile
              </MobileNavLink>
              <MobileNavLink to="/members" active={location.pathname.startsWith("/members")} onClick={closeMobileMenu}>
                <Users size={18} className="mr-3" />
                Members
              </MobileNavLink>
              <MobileNavLink
                to="/calendar"
                active={location.pathname.startsWith("/calendar")}
                onClick={closeMobileMenu}
              >
                <Calendar size={18} className="mr-3" />
                Calendar
              </MobileNavLink>
              <MobileNavLink
                to="/equipment"
                active={location.pathname.startsWith("/equipment")}
                onClick={closeMobileMenu}
              >
                <Package size={18} className="mr-3" />
                Equipment
              </MobileNavLink>
              <MobileNavLink
                to="/requests"
                active={location.pathname.startsWith("/requests")}
                onClick={closeMobileMenu}
              >
                <ClipboardList size={18} className="mr-3" />
                Requests
              </MobileNavLink>
              {user.is_admin && (
                <MobileNavLink to="/admin" active={location.pathname.startsWith("/admin")} onClick={closeMobileMenu}>
                  <User size={18} className="mr-3" />
                  Admin
                </MobileNavLink>
              )}

              {/* Mobile Logout */}
              <button
                onClick={() => {
                  closeMobileMenu()
                  handleLogout()
                }}
                className="flex items-center gap-3 text-sm font-medium text-orange-100 hover:text-white bg-red-600/80 hover:bg-red-600 px-3 py-2 rounded-lg transition-all duration-300 mx-2 mt-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

interface NavLinkProps {
  to: string
  active: boolean
  children: React.ReactNode
}

const NavLink = ({ to, active, children }: NavLinkProps) => (
  <Link
    to={to}
    className={`flex items-center text-sm font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:scale-105 ${
      active ? "text-white bg-gradient-orange shadow-lg" : "text-orange-200 hover:text-white hover:bg-orange-600/30"
    }`}
  >
    {children}
  </Link>
)

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void
}

const MobileNavLink = ({ to, active, children, onClick }: MobileNavLinkProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center text-sm font-medium transition-all duration-300 px-3 py-2 mx-2 rounded-lg ${
      active ? "bg-gradient-orange text-white shadow-lg" : "text-orange-200 hover:text-white hover:bg-orange-600/30"
    }`}
  >
    {children}
  </Link>
)

export default Navbar
