"use client"

import type React from "react"

import { Link, useNavigate, useLocation } from "react-router-dom"
import { Camera, Users, Calendar, Package, LogOut, User, ClipboardList } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  if (!user) return null

  return (
    <header className="navbar-gradient text-white shadow-2xl relative overflow-hidden">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-transparent animate-pulse"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between py-4">
          <Link
            to="/"
            className="flex items-center gap-3 text-2xl font-bold hover:scale-105 transition-transform duration-300"
          >
            <div className="p-2 bg-gradient-orange rounded-lg shadow-lg">
              <Camera size={28} className="text-white" />
            </div>
            <span className="gradient-text bg-gradient-to-r from-orange-300 to-orange-100 bg-clip-text text-transparent">
              TFPS
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
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

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-black/20 rounded-lg px-3 py-2 backdrop-blur-sm">
              <div className="avatar h-10 w-10 text-sm shadow-lg">{getInitial(user.name)}</div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-orange-100">{user.name}</div>
                {user.is_admin && <div className="text-xs text-orange-300 font-semibold">Admin</div>}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-orange-100 hover:text-white bg-red-600/80 hover:bg-red-600 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t border-orange-400/30 py-3">
          <div className="flex justify-between bg-black/20 rounded-lg p-2 backdrop-blur-sm">
            <MobileNavLink to="/profile" active={location.pathname.startsWith("/profile")}>
              <User size={20} />
            </MobileNavLink>
            <MobileNavLink to="/members" active={location.pathname.startsWith("/members")}>
              <Users size={20} />
            </MobileNavLink>
            <MobileNavLink to="/calendar" active={location.pathname.startsWith("/calendar")}>
              <Calendar size={20} />
            </MobileNavLink>
            <MobileNavLink to="/equipment" active={location.pathname.startsWith("/equipment")}>
              <Package size={20} />
            </MobileNavLink>
            <MobileNavLink to="/requests" active={location.pathname.startsWith("/requests")}>
              <ClipboardList size={20} />
            </MobileNavLink>
            {user.is_admin && (
              <MobileNavLink to="/admin" active={location.pathname.startsWith("/admin")}>
                <User size={20} />
              </MobileNavLink>
            )}
          </div>
        </div>
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

const MobileNavLink = ({ to, active, children }: NavLinkProps) => (
  <Link
    to={to}
    className={`p-3 rounded-lg transition-all duration-300 hover:scale-110 ${
      active ? "bg-gradient-orange text-white shadow-lg" : "text-orange-200 hover:text-white hover:bg-orange-600/30"
    }`}
  >
    {children}
  </Link>
)

export default Navbar
