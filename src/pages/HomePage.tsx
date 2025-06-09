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
  Sparkles,
  Award,
  Film,
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Floating particles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-pulse opacity-40 animation-delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full animate-pulse opacity-50 animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative overflow-hidden">
        {/* Gradient background with glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10"></div>
        
        {/* Glass overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/5"></div>
        
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 group-hover:scale-110 transition-all duration-500">
                <Camera className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">TFPS</h1>
                <p className="text-amber-100 text-sm font-medium drop-shadow">Technology Film and Photography Society</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="glass-button text-white hover:text-amber-100 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
              >
                Login
              </Link>
              <a
                href="#register"
                className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md border border-white/30 text-white hover:from-white/30 hover:to-white/20 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-xl"
              >
                Register for Event
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 animate-gradient bg-[length:400%_400%]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl animate-pulse animation-delay-1000"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/30">
              <Sparkles className="h-5 w-5 text-amber-200" />
              <span className="text-white font-medium">Where Creativity Meets Technology</span>
            </div>
            
            <h2 className="text-7xl font-bold mb-6 text-white drop-shadow-2xl">
              <span className="bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
                TFPS
              </span>
            </h2>
            <p className="text-2xl text-amber-100 mb-4 font-light drop-shadow-lg">Technology Film and Photography Society</p>
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow">
              Where creativity meets technology. Join our vibrant community of photographers and filmmakers as we capture stories, create art, and push the boundaries of visual expression.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="#register"
                className="glass-button-primary px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-2xl"
              >
                Join Our Community
                <ChevronRight className="ml-2 h-5 w-5 inline" />
              </a>
              <a
                href="#about"
                className="glass-button px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Movies Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full px-6 py-3 mb-6">
              <Film className="h-5 w-5 text-amber-600" />
              <span className="text-amber-800 font-semibold">Latest Creations</span>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Recent Movies</h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Watch our latest film productions and documentaries created by our talented members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentMovies.map((movie, index) => (
              <div 
                key={movie.id} 
                className="glass-card group hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative">
                  <div className="aspect-video bg-gray-900 relative overflow-hidden rounded-t-2xl">
                    <iframe
                      src={`https://www.youtube.com/embed/${movie.youtubeId}`}
                      title={movie.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    {movie.duration}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-amber-700 transition-colors">
                    {movie.title}
                  </h4>
                  <p className="text-gray-600 mb-4 leading-relaxed">{movie.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-amber-600" />
                      <span className="font-medium">{movie.views} views</span>
                    </div>
                    <a
                      href={`https://youtube.com/watch?v=${movie.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 transition-colors"
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
      <section className="py-20 bg-gradient-to-br from-orange-50 to-amber-50 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full px-6 py-3 mb-6">
              <Instagram className="h-5 w-5 text-pink-600" />
              <span className="text-pink-800 font-semibold">Social Media</span>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Follow Us on Instagram</h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Stay updated with our latest activities, behind-the-scenes content, and creative works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {instagramPosts.map((post, index) => (
              <div 
                key={post.id} 
                className="glass-card group hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="h-64 overflow-hidden rounded-t-2xl">
                  <img
                    src={post.image}
                    alt="Instagram post"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mr-3">
                        <Instagram className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">@tfps_official</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{post.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">{post.caption}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">♥</span>
                      </div>
                      <span className="font-medium">{post.likes} likes</span>
                    </div>
                    <a
                      href={post.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      View Post
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://instagram.com/tfps_official"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-xl"
            >
              <Instagram className="mr-3 h-6 w-6" />
              Follow @tfps_official
              <ExternalLink className="ml-3 h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Movie Reviews Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full px-6 py-3 mb-6">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-semibold">Reviews & Analysis</span>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Recent Movie Reviews</h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Read our members' thoughtful reviews and analyses of films, exploring cinematography, storytelling, and visual arts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {movieReviews.map((review, index) => (
              <div 
                key={review.id} 
                className="glass-card group hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
                        {review.platformIcon}
                      </div>
                      <span className="text-sm font-semibold text-blue-600">{review.platform}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{review.date}</span>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {review.title}
                  </h4>
                  <p className="text-sm text-gray-500 mb-3 font-medium">by {review.author}</p>
                  <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">{review.excerpt}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {review.readTime && (
                        <span className="bg-gray-100 px-2 py-1 rounded-full font-medium">{review.readTime}</span>
                      )}
                      {review.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{review.rating}/5</span>
                        </div>
                      )}
                    </div>
                    <a
                      href={review.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      Read More
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="https://medium.com/@tfps"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button-secondary inline-flex items-center px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <BookOpen className="mr-3 h-6 w-6" />
                Follow on Medium
                <ExternalLink className="ml-3 h-5 w-5" />
              </a>
              <a
                href="https://letterboxd.com/tfps"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button-secondary inline-flex items-center px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <Star className="mr-3 h-6 w-6" />
                Follow on Letterboxd
                <ExternalLink className="ml-3 h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Public Events Section */}
      <section id="register" className="py-20 bg-gradient-to-br from-amber-50 to-orange-50 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-6 py-3 mb-6">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-semibold">Upcoming Events</span>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Register for Events</h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Join our upcoming public events and workshops. These events are open for everyone to participate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingPublicEvents.length > 0 ? (
              upcomingPublicEvents.map((publicEvent, index) => (
                <div 
                  key={publicEvent.id} 
                  className="glass-card group hover:scale-105 transition-all duration-500"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                          {publicEvent.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-2 font-medium">
                          {new Date(publicEvent.start_time).toLocaleDateString()} at{" "}
                          {new Date(publicEvent.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                          publicEvent.event_type === "workshop"
                            ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white"
                            : publicEvent.event_type === "screening"
                              ? "bg-gradient-to-r from-purple-400 to-purple-500 text-white"
                              : publicEvent.event_type === "exhibition"
                                ? "bg-gradient-to-r from-green-400 to-green-500 text-white"
                                : publicEvent.event_type === "competition"
                                  ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white"
                                  : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                        }`}
                      >
                        {publicEvent.event_type.charAt(0).toUpperCase() + publicEvent.event_type.slice(1)}
                      </span>
                    </div>

                    {publicEvent.location && (
                      <div className="flex items-center mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                        <MapPin className="h-4 w-4 mr-2 text-amber-600" />
                        {publicEvent.location}
                      </div>
                    )}

                    {publicEvent.description && (
                      <p className="mt-4 text-sm text-gray-600 leading-relaxed">{publicEvent.description}</p>
                    )}

                    {publicEvent.max_participants && (
                      <p className="mt-3 text-xs text-gray-500 bg-amber-50 rounded-lg px-3 py-2">
                        Limited to {publicEvent.max_participants} participants
                      </p>
                    )}

                    <div className="mt-6">
                      {registerSuccess === publicEvent.id ? (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                          <p className="text-sm text-green-800 font-medium">
                            Registration successful! We'll contact you with more details.
                          </p>
                        </div>
                      ) : registering === publicEvent.id ? (
                        <form onSubmit={(e) => handleRegisterSubmit(e, publicEvent.id)} className="space-y-4">
                          <div>
                            <input
                              type="text"
                              placeholder="Your Name *"
                              className="glass-input text-sm"
                              value={registerForm.name}
                              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="email"
                              placeholder="Your Email *"
                              className="glass-input text-sm"
                              value={registerForm.email}
                              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="tel"
                              placeholder="Your Phone (Optional)"
                              className="glass-input text-sm"
                              value={registerForm.phone}
                              onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Roll Number (e.g., 21CS001) *"
                              className="glass-input text-sm"
                              value={registerForm.roll_number}
                              onChange={(e) => setRegisterForm({ ...registerForm, roll_number: e.target.value.toUpperCase() })}
                              required
                            />
                          </div>
                          <div>
                            <select
                              className="glass-input text-sm"
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
                              className="glass-input text-sm"
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
                              className="glass-input text-sm"
                              rows={2}
                              value={registerForm.additional_info}
                              onChange={(e) => setRegisterForm({ ...registerForm, additional_info: e.target.value })}
                            />
                          </div>
                          {registerError && (
                            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{registerError}</p>
                          )}
                          <div className="flex gap-3">
                            <button type="submit" className="glass-button-primary text-sm py-3 px-4 flex-1 rounded-xl">
                              Register
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRegistering(null)
                                setRegisterError(null)
                              }}
                              className="glass-button text-sm py-3 px-4 rounded-xl"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setRegistering(publicEvent.id)}
                          className="glass-button-primary w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
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
              <div className="col-span-1 md:col-span-3 text-center py-16">
                <div className="glass-card max-w-md mx-auto p-8">
                  <Calendar className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">No upcoming events</h4>
                  <p className="text-gray-600">
                    Check back later for new events or contact us for more information.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full px-6 py-3 mb-6">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="text-purple-800 font-semibold">What We Offer</span>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">What We Offer</h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              TFPS provides a comprehensive platform for photography and film enthusiasts to grow their skills and
              collaborate on projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Camera className="h-8 w-8" />}
              title="Equipment Access"
              description="Access professional cameras, lenses, and filming equipment for your projects."
              delay={0}
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Community"
              description="Connect with like-minded photographers and filmmakers in our vibrant community."
              delay={100}
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Events & Shoots"
              description="Participate in organized shoots, screenings, and photography workshops."
              delay={200}
            />
            <FeatureCard
              icon={<Package className="h-8 w-8" />}
              title="Project Management"
              description="Organize and manage your creative projects with our integrated tools."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-sm"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <StatCard number="150+" label="Active Members" delay={0} />
            <StatCard number="50+" label="Equipment Items" delay={100} />
            <StatCard number="200+" label="Projects Completed" delay={200} />
            <StatCard number="25+" label="Awards Won" delay={300} />
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="inquiry" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full px-6 py-3 mb-6">
                <Mail className="h-5 w-5 text-teal-600" />
                <span className="text-teal-800 font-semibold">Get in Touch</span>
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h3>
              <p className="text-gray-600 text-lg">
                Have questions about joining TFPS or need more information? We'd love to hear from you!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="glass-card p-8">
                <h4 className="text-2xl font-semibold text-gray-900 mb-8">Contact Information</h4>
                <div className="space-y-6">
                  <ContactItem icon={<Mail className="h-6 w-6 text-amber-600" />} text="contact@tfps.edu" />
                  <ContactItem icon={<Phone className="h-6 w-6 text-amber-600" />} text="+91 98765 43210" />
                  <ContactItem icon={<MapPin className="h-6 w-6 text-amber-600" />} text="Student Activity Center, Campus" />
                </div>

                <div className="mt-10">
                  <h5 className="font-semibold text-gray-900 mb-4 text-lg">Office Hours</h5>
                  <div className="text-gray-600 space-y-2 bg-amber-50 rounded-xl p-4">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span className="font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span className="font-medium">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span className="font-medium">Closed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inquiry Form */}
              <div className="glass-card p-8">
                <form onSubmit={handleInquirySubmit} className="space-y-6">
                  {submitSuccess && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
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
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="glass-input"
                        value={inquiryForm.name}
                        onChange={handleInquiryChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="glass-input"
                        value={inquiryForm.email}
                        onChange={handleInquiryChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="glass-input"
                      value={inquiryForm.phone}
                      onChange={handleInquiryChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                      Inquiry Type *
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      required
                      className="glass-input"
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
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      className="glass-input"
                      value={inquiryForm.subject}
                      onChange={handleInquiryChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      className="glass-input"
                      value={inquiryForm.message}
                      onChange={handleInquiryChange}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full glass-button-primary py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-3"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ChevronRight className="ml-2 h-5 w-5" />
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
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-xl">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">TFPS</h3>
                  <p className="text-gray-400 text-sm">Technology Film and Photography Society</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Empowering creativity through technology, fostering a community of passionate photographers and
                filmmakers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-300">
                <li>
                  <a href="#about" className="hover:text-amber-400 transition-colors duration-300 flex items-center group">
                    <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#register" className="hover:text-amber-400 transition-colors duration-300 flex items-center group">
                    <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Register for Events
                  </a>
                </li>
                <li>
                  <a href="#inquiry" className="hover:text-amber-400 transition-colors duration-300 flex items-center group">
                    <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Contact
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-amber-400 transition-colors duration-300 flex items-center group">
                    <ChevronRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Member Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">Connect With Us</h4>
              <div className="text-gray-300 space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-amber-400" />
                  <span>contact@tfps.edu</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-amber-400" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-amber-400" />
                  <span>Student Activity Center</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <SocialLink href="https://instagram.com/tfps_official" icon={<Instagram className="h-5 w-5" />} />
                <SocialLink href="https://medium.com/@tfps" icon={<BookOpen className="h-5 w-5" />} />
                <SocialLink href="https://letterboxd.com/tfps" icon={<Star className="h-5 w-5" />} />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
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
  delay: number
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
  <div 
    className="glass-card text-center p-8 group hover:scale-105 transition-all duration-500"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
      {icon}
    </div>
    <h4 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-amber-700 transition-colors">{title}</h4>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
)

interface StatCardProps {
  number: string
  label: string
  delay: number
}

const StatCard = ({ number, label, delay }: StatCardProps) => (
  <div 
    className="text-center group"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="text-5xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
      {number}
    </div>
    <div className="text-amber-100 font-medium text-lg">{label}</div>
  </div>
)

interface ContactItemProps {
  icon: React.ReactNode
  text: string
}

const ContactItem = ({ icon, text }: ContactItemProps) => (
  <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors duration-300">
    <div className="flex-shrink-0">{icon}</div>
    <span className="text-gray-700 font-medium">{text}</span>
  </div>
)

interface SocialLinkProps {
  href: string
  icon: React.ReactNode
}

const SocialLink = ({ href, icon }: SocialLinkProps) => (
  <a 
    href={href} 
    className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 hover:scale-110 shadow-lg"
    target="_blank"
    rel="noopener noreferrer"
  >
    {icon}
  </a>
)

export default HomePage
