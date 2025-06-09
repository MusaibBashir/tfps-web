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
  Play,
  Star,
  BookOpen,
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
    roll_number: "",
    domain: "Photography",
    year: "ug_1st",
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

  // Roll number validation function
  const validateRollNumber = (rollNumber: string): boolean => {
    // Check if roll number starts with two digits followed by two letters
    const rollPattern = /^[0-9]{2}[A-Za-z]{2}.*$/
    return rollPattern.test(rollNumber)
  }

  const handleRegisterSubmit = async (e: FormEvent, publicEventId: string) => {
    e.preventDefault()
    setRegisterError(null)

    // Validate roll number format
    if (!validateRollNumber(registerForm.roll_number)) {
      setRegisterError("Roll number must start with 2 digits followed by 2 letters (e.g., 21CS001)")
      return
    }

    try {
      const { error } = await supabase.from("publicevent_registrations").insert({
        publicevent_id: publicEventId,
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone || null,
        roll_number: registerForm.roll_number,
        domain: registerForm.domain,
        year: registerForm.year,
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
        roll_number: "",
        domain: "Photography",
        year: "ug_1st",
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

  // Recent movies with YouTube embeds
  const recentMovies = [
    {
      id: 1,
      title: "Campus Chronicles",
      youtubeId: "dQw4w9WgXcQ",
      description: "A documentary capturing the essence of student life and creativity on campus.",
      duration: "12:45",
      views: "2.3K",
    },
    {
      id: 2,
      title: "Through the Lens",
      youtubeId: "jNQXAC9IVRw",
      description: "A short film exploring the art of photography and visual storytelling.",
      duration: "8:30",
      views: "1.8K",
    },
    {
      id: 3,
      title: "TFPS Annual Showcase",
      youtubeId: "9bZkp7q19f0",
      description: "Highlights from our annual photography and film exhibition.",
      duration: "15:20",
      views: "4.1K",
    },
  ]

  // Instagram posts
  const instagramPosts = [
    {
      id: "post1",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&auto=format&fit=crop",
      caption: "Behind the scenes at our latest shoot! The magic happens when creativity meets passion. 📸✨ #TFPS #Photography #BehindTheScenes",
      likes: 124,
      date: "2 days ago",
      instagramUrl: "https://instagram.com/p/example1",
    },
    {
      id: "post2",
      image: "https://images.unsplash.com/photo-1496559249665-c7e2874707ea?w=400&auto=format&fit=crop",
      caption: "Congratulations to our photography contest winners! Your talent continues to inspire us all. 🏆 #TFPS #Contest #Winners",
      likes: 89,
      date: "5 days ago",
      instagramUrl: "https://instagram.com/p/example2",
    },
    {
      id: "post3",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop",
      caption: "New equipment just arrived! Can't wait to see what amazing content our members create with these tools. 📷 #TFPS #NewGear #Equipment",
      likes: 156,
      date: "1 week ago",
      instagramUrl: "https://instagram.com/p/example3",
    },
  ]

  // Movie reviews from Medium and Letterboxd
  const movieReviews = [
    {
      id: 1,
      title: "The Art of Visual Storytelling in Modern Cinema",
      platform: "Medium",
      author: "Sarah Chen",
      excerpt: "An in-depth analysis of how contemporary filmmakers use visual elements to enhance narrative...",
      readTime: "8 min read",
      url: "https://medium.com/@sarahchen/visual-storytelling-modern-cinema",
      platformIcon: <BookOpen className="h-4 w-4" />,
      date: "3 days ago",
    },
    {
      id: 2,
      title: "Parasite: A Masterclass in Cinematography",
      platform: "Letterboxd",
      author: "Alex Rodriguez",
      excerpt: "Bong Joon-ho's visual composition creates a perfect metaphor for social inequality...",
      rating: 4.5,
      url: "https://letterboxd.com/alexr/film/parasite-2019/",
      platformIcon: <Star className="h-4 w-4" />,
      date: "1 week ago",
    },
    {
      id: 3,
      title: "Documentary Photography vs. Cinematic Truth",
      platform: "Medium",
      author: "Michael Park",
      excerpt: "Exploring the fine line between documentary authenticity and artistic interpretation...",
      readTime: "12 min read",
      url: "https://medium.com/@michaelpark/documentary-vs-cinematic-truth",
      platformIcon: <BookOpen className="h-4 w-4" />,
      date: "2 weeks ago",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-900 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold">TFPS</h1>
                <p className="text-primary-200 text-sm">Technology Film and Photography Society</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-primary-200 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Login
              </Link>
              <a
                href="#register"
                className="bg-primary-600 hover:bg-primary-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Register for Event
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-6xl font-bold mb-6">TFPS</h2>
          <p className="text-2xl text-primary-100 mb-4 font-light">Technology Film and Photography Society</p>
          <p className="text-xl text-primary-200 mb-8 max-w-3xl mx-auto">
            Where creativity meets technology. Join our vibrant community of photographers and filmmakers as we capture stories, create art, and push the boundaries of visual expression.
          </p>
        </div>
      </section>

      {/* Recent Movies Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Recent Movies</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Watch our latest film productions and documentaries created by our talented members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentMovies.map((movie) => (
              <div key={movie.id} className="bg-white rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="relative">
                  <div className="aspect-video bg-gray-900 relative overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${movie.youtubeId}`}
                      title={movie.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    {movie.duration}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{movie.title}</h4>
                  <p className="text-gray-600 mb-4">{movie.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      {movie.views} views
                    </div>
                    <a
                      href={`https://youtube.com/watch?v=${movie.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                    >
                      Watch on YouTube
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Follow Us on Instagram</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with our latest activities, behind-the-scenes content, and creative works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instagramPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-64 overflow-hidden">
                  <img
                    src={post.image}
                    alt="Instagram post"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Instagram className="h-5 w-5 text-pink-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">@tfps_official</span>
                    </div>
                    <span className="text-xs text-gray-500">{post.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">{post.caption}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">{post.likes} likes</div>
                    <a
                      href={post.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-800 text-sm font-medium flex items-center gap-1"
                    >
                      View on Instagram
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://instagram.com/tfps_official"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              <Instagram className="mr-2 h-5 w-5" />
              Follow @tfps_official
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Movie Reviews Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Recent Movie Reviews</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Read our members' thoughtful reviews and analyses of films, exploring cinematography, storytelling, and visual arts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {movieReviews.map((review) => (
              <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {review.platformIcon}
                    <span className="text-sm font-medium text-gray-600">{review.platform}</span>
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                
                <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{review.title}</h4>
                <p className="text-sm text-gray-500 mb-3">by {review.author}</p>
                <p className="text-gray-600 mb-4 line-clamp-3">{review.excerpt}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {review.readTime && <span>{review.readTime}</span>}
                    {review.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{review.rating}/5</span>
                      </div>
                    )}
                  </div>
                  <a
                    href={review.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center gap-1"
                  >
                    Read More
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://medium.com/@tfps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-gray-700 bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Follow on Medium
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
              <a
                href="https://letterboxd.com/tfps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-700 bg-blue-100 hover:bg-blue-200 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Star className="mr-2 h-5 w-5" />
                Follow on Letterboxd
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Public Events Section */}
      <section id="register" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Register for Events</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join our upcoming public events and workshops. These events are open for everyone to participate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingPublicEvents.length > 0 ? (
              upcomingPublicEvents.map((publicEvent) => (
                <div key={publicEvent.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
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
                            <input
                              type="text"
                              placeholder="Roll Number (e.g., 21CS001) *"
                              className="input text-sm"
                              value={registerForm.roll_number}
                              onChange={(e) => setRegisterForm({ ...registerForm, roll_number: e.target.value.toUpperCase() })}
                              required
                            />
                          </div>
                          <div>
                            <select
                              className="input text-sm"
                              value={registerForm.year}
                              onChange={(e) => setRegisterForm({ ...registerForm, year: e.target.value })}
                              required
                            >
                              <option value="ug_1st">UG - 1st Year</option>
                              <option value="ug_2nd">UG - 2nd Year</option>
                              <option value="ug_3rd">UG - 3rd Year</option>
                              <option value="ug_4th">UG - 4th Year</option>
                              <option value="ug_5th">UG - 5th Year</option>
                              <option value="pg_1st">PG - 1st Year</option>
                              <option value="pg_2nd">PG - 2nd Year</option>
                            </select>
                          </div>
                          <div>
                            <select
                              className="input text-sm"
                              value={registerForm.domain}
                              onChange={(e) => setRegisterForm({ ...registerForm, domain: e.target.value })}
                              required
                            >
                              <option value="Photography">Photography</option>
                              <option value="Cinematography">Cinematography</option>
                              <option value="Editing">Editing</option>
                              <option value="Scriptwriting">Scriptwriting</option>
                              <option value="Sound & Music">Sound & Music</option>
                              <option value="Design">Design</option>
                            </select>
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

      {/* Stats Section */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
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
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">25+</div>
              <div className="text-gray-600">Awards Won</div>
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
                          <svg className="h-5 w-5 text-green-400\" viewBox="0 0 20 20\" fill="currentColor">
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
                  <a href="#register" className="hover:text-white transition-colors">
                    Register for Events
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
                <a href="https://instagram.com/tfps_official" className="text-gray-400 hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://medium.com/@tfps" className="text-gray-400 hover:text-white">
                  <BookOpen className="h-5 w-5" />
                </a>
                <a href="https://letterboxd.com/tfps" className="text-gray-400 hover:text-white">
                  <Star className="h-5 w-5" />
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
