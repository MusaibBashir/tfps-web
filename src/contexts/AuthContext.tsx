"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSupabase } from "./SupabaseContext"
import type { User } from "../types"

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helper function to clear all cookies
const clearAllCookies = () => {
  const cookies = document.cookie.split(";")

  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=")
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()

    // Clear cookie for current domain
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { supabase } = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for user session on load
    const checkUser = async () => {
      try {
        const userId = localStorage.getItem("user_id")
        if (!userId) {
          setUser(null)
          setLoading(false)
          return
        }

        const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

        if (error || !data) {
          localStorage.removeItem("user_id")
          clearAllCookies()
          setUser(null)
        } else {
          setUser(data as User)
        }
      } catch (error) {
        console.error("Error checking user session:", error)
        localStorage.removeItem("user_id")
        clearAllCookies()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [supabase])

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password) // In a real app, use secure password hashing!
        .single()

      if (error || !data) {
        return { error: "Invalid username or password" }
      }

      localStorage.setItem("user_id", data.id)
      setUser(data as User)
      return { error: null }
    } catch (error) {
      console.error("Login error:", error)
      return { error: "An unexpected error occurred" }
    }
  }

  const logout = async () => {
    try {
      // Clear local storage
      localStorage.clear()

      // Clear session storage
      sessionStorage.clear()

      // Clear all cookies
      clearAllCookies()

      // Clear user state
      setUser(null)

      // Use relative path instead of full URL to avoid 404
      window.location.pathname = "/login"
    } catch (error) {
      console.error("Logout error:", error)
      // Fallback: still clear state even if there's an error
      localStorage.clear()
      sessionStorage.clear()
      clearAllCookies()
      setUser(null)
      window.location.pathname = "/login"
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}
