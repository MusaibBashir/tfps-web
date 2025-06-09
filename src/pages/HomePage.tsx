"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Camera,
  Users,
  Calendar,
  Package,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Instagram,
  ExternalLink,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useSupabase } from "../contexts/SupabaseContext"
import type { PublicEvent } from "../types"

const HomePage = () => {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const navigate = useNavigate()
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "general",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [upcomingPublicEvents, setUpcomingPublicEvents] = useState<PublicEvent[]>([])
  const [registering, setRegistering] = useState<string | null>(null)
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    additional_info: "",
  })
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null)
  const [registerError, setRegisterError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch upcoming public events
    const fetchPublicEvents = async () => {
      try {
        const { data } = await supabase
          .from("publicevents")
          .select("*")
          .eq("is_active", true)
          .gte("start_time", new Date().toISOString())
          .order("start_time")
          .limit(3)

        setUpcomingPublicEvents(data || [])
      } catch (error) {
        console.error("Error fetching public events:", error)
      }
    }

    fetchPublicEvents()
  }, [supabase])

  const handleInquirySubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSubmitSuccess(true)
    setInquiryForm({
      name: "",
      email: "",
      phone: "",
      inquiryType: "general",
      subject: "",
      message: "",
    })
    setIsSubmitting(false)

    // Hide success message after 3 seconds
    setTimeout(() => setSubmitSuccess(false), 3000)
  }

  const handleInquiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setInquiryForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegisterSubmit = async (e: FormEvent, publicEventId: string) => {
    e.preventDefault()
    setRegisterError(null)

    try {
      const { error } = await supabase.from("publicevent_registrations").insert({
        publicevent_id: publicEventId,
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone || null,
        additional_info: registerForm.additional_info || null,
      })

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          setRegisterError("You have already registered for this event.")
        } else {
          throw error
        }
        return
      }

      setRegisterSuccess(publicEventId)
      setRegistering(null)

      // Reset form
      setRegisterForm({
        name: "",
        email: "",
        phone: "",
        additional_info: "",
      })

      // Clear success message after 3 seconds
      setTimeout(() => setRegisterSuccess(null), 3000)
    } catch (error) {
      console.error("Error registering for public event:", error)
      setRegisterError("Failed to register for event. Please try again.")
    }
  }

  // If user is logged in, redirect to dashboard
  if (user) {
    navigate("/")
    return null
  }

  // Sample recent works data
  const recentWorks = [
    {
      id: 1,
      title: "Campus Life Documentary",
      image: "https://images.unsplash.com/photo-1604122230703-9e7b4b3e6613?w=800&auto=format&fit=crop",
      category: "Film",
      description: "A documentary showcasing the vibrant campus life and student activities.",
    },
    {
      id: 2,
      title: "Annual Photography Exhibition",
      image: "https://images.unsplash.com/photo-1552168324-d612d77725e3?w=800&auto=format&fit=crop",
      category: "Photography",
      description: "Collection of the best photographs from our annual exhibition.",
    },
    {
      id: 3,
      title: "Nature Through The Lens",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop",
      category: "Photography",
      description: "A series capturing the beauty of nature around our campus.",
    },
    {
      id: 4,
      title: "Short Film Festival Winners",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop",
      category: "Film",
      description: "Award-winning short films from our student film festival.",
    },
  ]

  // Sample Instagram posts
  const instagramPosts = [
    {
      id: "post1",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&auto=format&fit=crop",
      caption: "Behind the scenes at our latest shoot! #TFPS #Photography",
      likes: 124,
      date: "2 days ago",
    },
    {
      id: "post2",
      image: "https://images.unsplash.com/photo-1496559249665-c7e2874707ea?w=400&auto=format&fit=crop",
      caption: "Congratulations to our photography contest winners! #TFPS #Contest",
      likes: 89,
      date: "5 days ago",
    },
    {
      id: "post3",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop",
      caption: "New equipment just arrived! Can't wait to try it out. #TFPS #NewGear",
      likes: 156,
      date: "1 week ago",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold">TFPS</h1>
                <p className="text-primary-200 text-sm">Technology Film and Photography Society</p>
              </div>
            </div>
            <Link
              to="/login"
              className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Member Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Capture. Create. Connect.</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join our vibrant community of photographers and filmmakers. Share your passion, learn new skills, and create
            amazing content together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#inquiry"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get in Touch
            </a>
            <a
              href="#about"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Recent Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Recent Works</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore the latest projects and creative works from our talented community members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentWorks.map((work) => (
              <div key={work.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
                <div className="h-48 overflow-hidden">
                  <img
                    src={work.image || "/placeholder.svg"}
                    alt={work.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                    {work.category}
                  </span>
                  <h4 className="text-lg font-semibold text-gray-900 mt-1">{work.title}</h4>
                  <p className="text-sm text-gray-600 mt-2">{work.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="#"
              className="inline-flex items-center text-primary-600 font-medium hover:text-primary-800 transition-colors"
            >
              View All Works
              <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Upcoming Public Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Events</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join our upcoming public events and workshops. These events are open for everyone to participate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingPublicEvents.length > 0 ? (
              upcomingPublicEvents.map((publicEvent) => (
                <div key={publicEvent.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">{publicEvent.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(publicEvent.start_time).toLocaleDateString()} at{" "}
                          {new Date(publicEvent.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          publicEvent.event_type === "workshop"
                            ? "bg-blue-100 text-blue-800"
                            : publicEvent.event_type === "screening"
                              ? "bg-purple-100 text-purple-800"
                              : publicEvent.event_type === "exhibition"
                                ? "bg-green-100 text-green-800"
                                : publicEvent.event_type === "competition"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {publicEvent.event_type.charAt(0).toUpperCase() + publicEvent.event_type.slice(1)}
                      </span>
                    </div>

                    {publicEvent.location && (
                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {publicEvent.location}
                      </div>
                    )}

                    {publicEvent.description && <p className="mt-4 text-sm text-gray-600">{publicEvent.description}</p>}

                    {publicEvent.max_participants && (
                      <p className="mt-2 text-xs text-gray-500">
                        Limited to {publicEvent.max_participants} participants
                      </p>
                    )}

                    <div className="mt-6">
                      {registerSuccess === publicEvent.id ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800">
                            Registration successful! We'll contact you with more details.
                          </p>
                        </div>
                      ) : registering === publicEvent.id ? (
                        <form onSubmit={(e) => handleRegisterSubmit(e, publicEvent.id)} className="space-y-3">
                          <div>
                            <input
                              type="text"
                              placeholder="Your Name *"
                              className="input text-sm"
                              value={registerForm.name}
                              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="email"
                              placeholder="Your Email *"
                              className="input text-sm"
                              value={registerForm.email}
                              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="tel"
                              placeholder="Your Phone (Optional)"
                              className="input text-sm"
                              value={registerForm.phone}
                              onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <textarea
                              placeholder="Additional information (Optional)"
                              className="input text-sm"
                              rows={2}
                              value={registerForm.additional_info}
                              onChange={(e) => setRegisterForm({ ...registerForm, additional_info: e.target.value })}
                            />
                          </div>
                          {registerError && <p className="text-xs text-red-600">{registerError}</p>}
                          <div className="flex gap-2">
                            <button type="submit" className="btn btn-primary text-sm py-1 px-3 flex-1">
                              Register
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRegistering(null)
                                setRegisterError(null)
                              }}
                              className="btn btn-outline text-sm py-1 px-3"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setRegistering(publicEvent.id)}
                          className="btn btn-primary w-full"
                          disabled={
                            publicEvent.registration_deadline &&
                            new Date() > new Date(publicEvent.registration_deadline)
                          }
                        >
                          {publicEvent.registration_deadline && new Date() > new Date(publicEvent.registration_deadline)
                            ? "Registration Closed"
                            : "Register for Event"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
                <h4 className="mt-4 text-lg font-medium text-gray-900">No upcoming events</h4>
                <p className="mt-2 text-gray-500">
                  Check back later for new events or contact us for more information.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">What We Offer</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              TFPS provides a comprehensive platform for photography and film enthusiasts to grow their skills and
              collaborate on projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Camera className="h-8 w-8" />}
              title="Equipment Access"
              description="Access professional cameras, lenses, and filming equipment for your projects."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Community"
              description="Connect with like-minded photographers and filmmakers in our vibrant community."
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Events & Shoots"
              description="Participate in organized shoots, screenings, and photography workshops."
            />
            <FeatureCard
              icon={<Package className="h-8 w-8" />}
              title="Project Management"
              description="Organize and manage your creative projects with our integrated tools."
            />
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Follow Us on Instagram</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with our latest activities, events, and creative works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instagramPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-64 overflow-hidden">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="Instagram post"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Instagram className="h-4 w-4 text-pink-600 mr-1" />
                      <span className="text-xs font-medium text-gray-900">@tfps_official</span>
                    </div>
                    <span className="text-xs text-gray-500">{post.date}</span>
                  </div>
                  <p className="text-sm text-gray-600">{post.caption}</p>
                  <div className="mt-3 text-xs text-gray-500">{post.likes} likes</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://instagram.com/tfps_official"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-pink-600 font-medium hover:text-pink-800 transition-colors"
            >
              <Instagram className="mr-2 h-5 w-5" />
              Follow us on Instagram
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">150+</div>
              <div className="text-gray-600">Active Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Equipment Items</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">200+</div>
              <div className="text-gray-600">Projects Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="inquiry" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h3>
              <p className="text-gray-600">
                Have questions about joining TFPS or need more information? We'd love to hear from you!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-600">contact@tfps.edu</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-600">+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-600">Student Activity Center, Campus</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h5 className="font-semibold text-gray-900 mb-3">Office Hours</h5>
                  <div className="text-gray-600 space-y-1">
                    <div>Monday - Friday: 9:00 AM - 6:00 PM</div>
                    <div>Saturday: 10:00 AM - 4:00 PM</div>
                    <div>Sunday: Closed</div>
                  </div>
                </div>
              </div>

              {/* Inquiry Form */}
              <div>
                <form onSubmit={handleInquirySubmit} className="space-y-6">
                  {submitSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            Thank you for your inquiry! We'll get back to you soon.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="input"
                        value={inquiryForm.name}
                        onChange={handleInquiryChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="input"
                        value={inquiryForm.email}
                        onChange={handleInquiryChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="input"
                      value={inquiryForm.phone}
                      onChange={handleInquiryChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-1">
                      Inquiry Type *
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      required
                      className="select"
                      value={inquiryForm.inquiryType}
                      onChange={handleInquiryChange}
                    >
                      <option value="general">General Information</option>
                      <option value="membership">Membership Inquiry</option>
                      <option value="equipment">Equipment Rental</option>
                      <option value="collaboration">Project Collaboration</option>
                      <option value="workshop">Workshop/Training</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      className="input"
                      value={inquiryForm.subject}
                      onChange={handleInquiryChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      className="input"
                      value={inquiryForm.message}
                      onChange={handleInquiryChange}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn btn-primary flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Camera className="h-8 w-8" />
                <div>
                  <h3 className="text-xl font-bold">TFPS</h3>
                  <p className="text-gray-400 text-sm">Technology Film and Photography Society</p>
                </div>
              </div>
              <p className="text-gray-400">
                Empowering creativity through technology, fostering a community of passionate photographers and
                filmmakers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#inquiry" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Member Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="text-gray-400 space-y-2">
                <div>Email: contact@tfps.edu</div>
                <div>Phone: +91 98765 43210</div>
                <div>Location: Student Activity Center</div>
              </div>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Technology Film and Photography Society. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
      {icon}
    </div>
    <h4 className="text-xl font-semibold text-gray-900 mb-2">{title}</h4>
    <p className="text-gray-600">{description}</p>
  </div>
)

export default HomePage
