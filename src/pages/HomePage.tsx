"use client"

import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Camera, Mail, Users, Calendar, ArrowRight } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const HomePage = () => {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    setFormSubmitted(true)
    setTimeout(() => {
      setShowForm(false)
      setFormSubmitted(false)
      setFormData({ name: "", email: "", message: "" })
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-900 to-black py-6 px-4 md:px-8">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Camera className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold">TFPS</h1>
          </div>
          <div className="space-x-4">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-gradient-to-b from-black to-orange-950">
        <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-orange-500">TFPS</span> Equipment Management System
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              Streamline equipment borrowing, tracking, and management for The Film and Photography Society.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors inline-flex items-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors inline-flex items-center"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
              <button
                onClick={() => setShowForm(true)}
                className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black px-6 py-3 rounded-md text-lg font-medium transition-colors"
              >
                Contact Us
              </button>
            </div>
          </div>
          <div className="relative animate-slide-in">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-orange-700 rounded-lg blur opacity-75"></div>
            <div className="relative bg-black rounded-lg overflow-hidden border border-orange-700">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="TFPS Equipment"
                className="w-full h-auto object-cover rounded-lg opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="text-xl font-bold text-white">Professional Equipment</h3>
                <p className="text-orange-300">Available for all society members</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 md:px-8 bg-black">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-lg border border-orange-900">
              <Camera className="h-10 w-10 text-orange-500 mb-4" />
              <h3 className="text-3xl font-bold text-white">50+</h3>
              <p className="text-orange-300">Equipment Items</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-lg border border-orange-900">
              <Users className="h-10 w-10 text-orange-500 mb-4" />
              <h3 className="text-3xl font-bold text-white">100+</h3>
              <p className="text-orange-300">Active Members</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-lg border border-orange-900">
              <Calendar className="h-10 w-10 text-orange-500 mb-4" />
              <h3 className="text-3xl font-bold text-white">20+</h3>
              <p className="text-orange-300">Monthly Events</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-lg border border-orange-900">
              <Mail className="h-10 w-10 text-orange-500 mb-4" />
              <h3 className="text-3xl font-bold text-white">24/7</h3>
              <p className="text-orange-300">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-orange-950 to-black">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="text-orange-500">Features</span> of Our Platform
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black p-6 rounded-lg border border-orange-800 hover:border-orange-500 transition-colors">
              <div className="h-12 w-12 bg-orange-900 rounded-full flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Equipment Management</h3>
              <p className="text-gray-400">
                Browse, request, and manage equipment with ease. Track status and availability in real-time.
              </p>
            </div>
            <div className="bg-black p-6 rounded-lg border border-orange-800 hover:border-orange-500 transition-colors">
              <div className="h-12 w-12 bg-orange-900 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Event Calendar</h3>
              <p className="text-gray-400">
                View upcoming events, workshops, and shoots. Request equipment specifically for events.
              </p>
            </div>
            <div className="bg-black p-6 rounded-lg border border-orange-800 hover:border-orange-500 transition-colors">
              <div className="h-12 w-12 bg-orange-900 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Member Profiles</h3>
              <p className="text-gray-400">
                Manage your profile, track your equipment history, and connect with other society members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 px-4 md:px-8 border-t border-orange-900">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Camera className="h-6 w-6 text-orange-500" />
              <span className="text-xl font-bold">TFPS</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} The Film and Photography Society. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-orange-700 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-orange-500">Contact Us</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            {formSubmitted ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-600 mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Thank You!</h3>
                <p className="text-gray-300">Your message has been sent successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
