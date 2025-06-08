"use client"

import type React from "react"

import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Camera, Users, Calendar, Package, Mail, Phone, MapPin, ChevronRight } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const HomePage = () => {
  const { user } = useAuth()
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

  // If user is logged in, redirect to dashboard
  if (user) {
    navigate("/")
    return null
  }

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
