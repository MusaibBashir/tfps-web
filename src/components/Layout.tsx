import type React from "react"
import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      <Navbar />
      <main className="flex-grow p-3 sm:p-6 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-orange-500 to-black pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <footer className="bg-gradient-black text-white border-t border-orange-500/20 py-4 sm:py-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent"></div>
        <div className="relative z-10 px-4">
          <p className="text-orange-200 font-medium text-sm sm:text-base">
            &copy; {new Date().getFullYear()} Technology Film and Photography Society
          </p>
          <p className="text-orange-300/70 text-xs sm:text-sm mt-1">Capturing moments, creating memories</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
