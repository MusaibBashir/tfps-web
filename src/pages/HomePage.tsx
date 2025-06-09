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
  Youtube,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useSupabase } from "../contexts/SupabaseContext"
import type { PublicEvent } from "../types"

const HomePage = () => {
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const navigate = useNavigate()
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

    // Load Instagram embed script
    const script = document.createElement('script')
    script.src = '//www.instagram.com/embed.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="//www.instagram.com/embed.js"]')
      if (existingScript) {
        document.body.removeChild(existingScript)
      }
    }
  }, [supabase])

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

  // Recent movies with real YouTube videos
  const recentMovies = [
    {
      id: 1,
      title: "TFPS Showreel 2024",
      youtubeId: "Ekuy8Ymvk68",
      description: "A showcase of our best photography and cinematography work from 2024.",
      duration: "3:45",
      views: "2.3K",
    },
    {
      id: 2,
      title: "Behind the Scenes",
      youtubeId: "7Ay0bQemOs8",
      description: "Get an inside look at how we create our stunning visual content.",
      duration: "5:20",
      views: "1.8K",
    },
    {
      id: 3,
      title: "TFPS Documentary",
      youtubeId: "V3cechi6Ovk",
      description: "The story of TFPS and our journey in visual storytelling.",
      duration: "8:15",
      views: "4.1K",
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

  // Governors data
  const governors = [
    {
      id: 1,
      name: "Arjun Sharma",
      position: "President",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    },
    {
      id: 2,
      name: "Priya Patel",
      position: "Vice President",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
    },
    {
      id: 3,
      name: "Rahul Kumar",
      position: "Secretary",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    },
    {
      id: 4,
      name: "Sneha Gupta",
      position: "Treasurer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-400 rounded-full animate-float animation-delay-1000 opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-float animation-delay-2000 opacity-50"></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-amber-500 rounded-full animate-float opacity-30"></div>
      </div>

      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-0 rounded-none backdrop-blur-xl bg-gradient-to-r from-amber-500/90 to-orange-500/90">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="p-2 bg-white/20 rounded-xl shadow-lg backdrop-blur-md">
                <Camera className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">TFPS</h1>
                <p className="text-amber-100 text-sm">Technology Film and Photography Society</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="glass-button px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 border-2 border-white/30 text-white hover:bg-white/20"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 animate-gradient"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in">
            <h2 className="text-7xl font-bold mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              TFPS
            </h2>
            <p className="text-3xl text-gray-700 mb-4 font-light">Technology Film and Photography Society</p>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Where creativity meets technology. Join our vibrant community of photographers and filmmakers as we capture stories, create art, and push the boundaries of visual expression.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Movies Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Recent Movies
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Watch our latest film productions and documentaries created by our talented members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentMovies.map((movie, index) => (
              <div 
                key={movie.id} 
                className="glass-card group hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
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
                  <div className="absolute top-3 right-3 glass-button px-2 py-1 rounded-lg text-sm font-medium">
                    {movie.duration}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{movie.title}</h4>
                  <p className="text-gray-600 mb-4 leading-relaxed">{movie.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      {movie.views} views
                    </div>
                    <a
                      href={`https://youtube.com/watch?v=${movie.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1 transition-colors"
                    >
                      Watch on YouTube
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.youtube.com/@TFPSIITKgp"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button-primary px-8 py-4 rounded-xl font-medium inline-flex items-center gap-3 hover:scale-105 transition-all duration-300"
            >
              <Youtube className="h-5 w-5" />
              Subscribe to Our Channel
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Follow Us on Instagram
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Stay updated with our latest activities, behind-the-scenes content, and creative works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Instagram Post 1 */}
            <div className="glass-card p-4 hover-lift animate-fade-in">
              <blockquote 
                className="instagram-media" 
                data-instgrm-captioned 
                data-instgrm-permalink="https://www.instagram.com/p/DKjzVjJsU9B/?utm_source=ig_embed&utm_campaign=loading" 
                data-instgrm-version="14" 
                style={{ 
                  background: 'transparent', 
                  border: 0, 
                  borderRadius: '3px', 
                  boxShadow: 'none', 
                  margin: '1px', 
                  maxWidth: '100%', 
                  minWidth: '326px', 
                  padding: 0, 
                  width: '100%' 
                }}
              >
                <div style={{ padding: '16px' }}>
                  <a 
                    href="https://www.instagram.com/p/DKjzVjJsU9B/?utm_source=ig_embed&utm_campaign=loading" 
                    style={{ 
                      background: '#FFFFFF', 
                      lineHeight: 0, 
                      padding: '0 0', 
                      textAlign: 'center', 
                      textDecoration: 'none', 
                      width: '100%' 
                    }} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', flexGrow: 0, height: '40px', marginRight: '14px', width: '40px' }}></div>
                      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
                        <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', marginBottom: '6px', width: '100px' }}></div>
                        <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', width: '60px' }}></div>
                      </div>
                    </div>
                    <div style={{ padding: '19% 0' }}></div>
                    <div style={{ display: 'block', height: '50px', margin: '0 auto 12px', width: '50px' }}>
                      <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                          <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                            <g>
                              <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                            </g>
                          </g>
                        </g>
                      </svg>
                    </div>
                    <div style={{ paddingTop: '8px' }}>
                      <div style={{ color: '#3897f0', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: '550', lineHeight: '18px' }}>
                        View this post on Instagram
                      </div>
                    </div>
                  </a>
                  <p style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', lineHeight: '17px', marginBottom: 0, marginTop: '8px', overflow: 'hidden', padding: '8px 0 7px', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href="https://www.instagram.com/p/DKjzVjJsU9B/?utm_source=ig_embed&utm_campaign=loading" style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: 'normal', lineHeight: '17px', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                      A post shared by TFPS | IIT Kharagpur (@tfps.iitkgp)
                    </a>
                  </p>
                </div>
              </blockquote>
            </div>

            {/* Instagram Post 2 */}
            <div className="glass-card p-4 hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <blockquote 
                className="instagram-media" 
                data-instgrm-captioned 
                data-instgrm-permalink="https://www.instagram.com/p/DJ9KYr3pp08/?utm_source=ig_embed&utm_campaign=loading" 
                data-instgrm-version="14" 
                style={{ 
                  background: 'transparent', 
                  border: 0, 
                  borderRadius: '3px', 
                  boxShadow: 'none', 
                  margin: '1px', 
                  maxWidth: '100%', 
                  minWidth: '326px', 
                  padding: 0, 
                  width: '100%' 
                }}
              >
                <div style={{ padding: '16px' }}>
                  <a 
                    href="https://www.instagram.com/p/DJ9KYr3pp08/?utm_source=ig_embed&utm_campaign=loading" 
                    style={{ 
                      background: '#FFFFFF', 
                      lineHeight: 0, 
                      padding: '0 0', 
                      textAlign: 'center', 
                      textDecoration: 'none', 
                      width: '100%' 
                    }} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', flexGrow: 0, height: '40px', marginRight: '14px', width: '40px' }}></div>
                      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
                        <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', marginBottom: '6px', width: '100px' }}></div>
                        <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', width: '60px' }}></div>
                      </div>
                    </div>
                    <div style={{ padding: '19% 0' }}></div>
                    <div style={{ display: 'block', height: '50px', margin: '0 auto 12px', width: '50px' }}>
                      <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                          <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                            <g>
                              <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                            </g>
                          </g>
                        </g>
                      </svg>
                    </div>
                    <div style={{ paddingTop: '8px' }}>
                      <div style={{ color: '#3897f0', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: '550', lineHeight: '18px' }}>
                        View this post on Instagram
                      </div>
                    </div>
                  </a>
                  <p style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', lineHeight: '17px', marginBottom: 0, marginTop: '8px', overflow: 'hidden', padding: '8px 0 7px', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href="https://www.instagram.com/p/DJ9KYr3pp08/?utm_source=ig_embed&utm_campaign=loading" style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: 'normal', lineHeight: '17px', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                      A post shared by ClickKGP (@click_kgp)
                    </a>
                  </p>
                </div>
              </blockquote>
            </div>

            {/* Instagram Post 3 */}
            <div className="glass-card p-4 hover-lift animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <blockquote 
                className="instagram-media" 
                data-instgrm-captioned 
                data-instgrm-permalink="https://www.instagram.com/p/DJtvbjnT1eS/?utm_source=ig_embed&utm_campaign=loading" 
                data-instgrm-version="14" 
                style={{ 
                  background: 'transparent', 
                  border: 0, 
                  borderRadius: '3px', 
                  boxShadow: 'none', 
                  margin: '1px', 
                  maxWidth: '100%', 
                  minWidth: '326px', 
                  padding: 0, 
                  width: '100%' 
                }}
              >
                <div style={{ padding: '16px' }}>
                  <a 
                    href="https://www.instagram.com/p/DJtvbjnT1eS/?utm_source=ig_embed&utm_campaign=loading" 
                    style={{ 
                      background: '#FFFFFF', 
                      lineHeight: 0, 
                      padding: '0 0', 
                      textAlign: 'center', 
                      textDecoration: 'none', 
                      width: '100%' 
                    }} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', flexGrow: 0, height: '40px', marginRight: '14px', width: '40px' }}></div>
                      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
                        <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', marginBottom: '6px', width: '100px' }}></div>
                        <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', width: '60px' }}></div>
                      </div>
                    </div>
                    <div style={{ padding: '19% 0' }}></div>
                    <div style={{ display: 'block', height: '50px', margin: '0 auto 12px', width: '50px' }}>
                      <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                          <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                            <g>
                              <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                            </g>
                          </g>
                        </g>
                      </svg>
                    </div>
                    <div style={{ paddingTop: '8px' }}>
                      <div style={{ color: '#3897f0', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: '550', lineHeight: '18px' }}>
                        View this post on Instagram
                      </div>
                    </div>
                  </a>
                  <p style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', lineHeight: '17px', marginBottom: 0, marginTop: '8px', overflow: 'hidden', padding: '8px 0 7px', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href="https://www.instagram.com/p/DJtvbjnT1eS/?utm_source=ig_embed&utm_campaign=loading" style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: 'normal', lineHeight: '17px', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                      A post shared by TFPS | IIT Kharagpur (@tfps.iitkgp)
                    </a>
                  </p>
                </div>
              </blockquote>
            </div>
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.instagram.com/tfps.iitkgp/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button-primary px-8 py-4 rounded-xl font-medium inline-flex items-center gap-3 hover:scale-105 transition-all duration-300"
            >
              <Instagram className="h-5 w-5" />
              Follow @tfps.iitkgp
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Movie Reviews Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Recent Movie Reviews
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Read our members' thoughtful reviews and analyses of films, exploring cinematography, storytelling, and visual arts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {movieReviews.map((review, index) => (
              <div 
                key={review.id} 
                className="glass-card p-6 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
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
                    className="text-amber-600 hover:text-amber-800 text-sm font-medium flex items-center gap-1 transition-colors"
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
                className="glass-button-secondary px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 hover:scale-105 transition-all duration-300"
              >
                <BookOpen className="h-5 w-5" />
                Follow on Medium
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://letterboxd.com/tfps"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button-secondary px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 hover:scale-105 transition-all duration-300"
              >
                <Star className="h-5 w-5" />
                Follow on Letterboxd
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Governors Section */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Meet Our Governors
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              The dedicated leaders who guide TFPS towards excellence in photography and filmmaking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {governors.map((governor, index) => (
              <div 
                key={governor.id} 
                className="glass-card p-6 text-center hover-lift animate-fade-in group"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-amber-200 group-hover:ring-amber-300 transition-all duration-300">
                    <img
                      src={governor.image}
                      alt={governor.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {governor.position}
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                  {governor.name}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Public Events Section */}
      <section id="register" className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Register for Events
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Join our upcoming public events and workshops. These events are open for everyone to participate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingPublicEvents.length > 0 ? (
              upcomingPublicEvents.map((publicEvent, index) => (
                <div 
                  key={publicEvent.id} 
                  className="glass-card overflow-hidden hover-lift animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
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
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
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
                      <div className="flex items-center mt-3 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {publicEvent.location}
                      </div>
                    )}

                    {publicEvent.description && <p className="mt-4 text-sm text-gray-600 leading-relaxed">{publicEvent.description}</p>}

                    {publicEvent.max_participants && (
                      <p className="mt-2 text-xs text-gray-500">
                        Limited to {publicEvent.max_participants} participants
                      </p>
                    )}

                    <div className="mt-6">
                      {registerSuccess === publicEvent.id ? (
                        <div className="glass-card bg-green-50/80 border-green-200 p-3">
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
                            <textarea
                              placeholder="Additional information (Optional)"
                              className="glass-input text-sm"
                              rows={2}
                              value={registerForm.additional_info}
                              onChange={(e) => setRegisterForm({ ...registerForm, additional_info: e.target.value })}
                            />
                          </div>
                          {registerError && <p className="text-xs text-red-600">{registerError}</p>}
                          <div className="flex gap-2">
                            <button type="submit" className="glass-button-primary text-sm py-2 px-4 flex-1 rounded-lg">
                              Register
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRegistering(null)
                                setRegisterError(null)
                              }}
                              className="glass-button-secondary text-sm py-2 px-4 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setRegistering(publicEvent.id)}
                          className="glass-button-primary w-full py-3 rounded-lg font-medium"
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
                <Calendar className="h-12 w-12 text-amber-400 mx-auto" />
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
      <section id="about" className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              What We Offer
            </h3>
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
              delay="0s"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Community"
              description="Connect with like-minded photographers and filmmakers in our vibrant community."
              delay="0.2s"
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Events & Shoots"
              description="Participate in organized shoots, screenings, and photography workshops."
              delay="0.4s"
            />
            <FeatureCard
              icon={<Package className="h-8 w-8" />}
              title="Project Management"
              description="Organize and manage your creative projects with our integrated tools."
              delay="0.6s"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-amber-500 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20 animate-gradient"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-5xl font-bold text-white mb-2">150+</div>
              <div className="text-amber-100 text-lg">Active Members</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-amber-100 text-lg">Equipment Items</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-5xl font-bold text-white mb-2">200+</div>
              <div className="text-amber-100 text-lg">Projects Completed</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="text-5xl font-bold text-white mb-2">25+</div>
              <div className="text-amber-100 text-lg">Awards Won</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
                Get in Touch
              </h3>
              <p className="text-gray-600 text-lg">
                Have questions about joining TFPS or need more information? We'd love to hear from you!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="glass-card p-8 animate-fade-in">
                <h4 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h4>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700 font-medium">contact@tfps.edu</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white">
                      <Phone className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700 font-medium">+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700 font-medium">Student Activity Center, Campus</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h5 className="font-semibold text-gray-900 mb-4 text-lg">Office Hours</h5>
                  <div className="text-gray-600 space-y-2">
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

                <div className="mt-8">
                  <h5 className="font-semibold text-gray-900 mb-4 text-lg">Follow Us</h5>
                  <div className="flex space-x-4">
                    <a 
                      href="https://www.instagram.com/tfps.iitkgp/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white hover:scale-110 transition-transform duration-300"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a 
                      href="https://www.youtube.com/@TFPSIITKgp" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white hover:scale-110 transition-transform duration-300"
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                    <a 
                      href="https://medium.com/@tfps" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl text-white hover:scale-110 transition-transform duration-300"
                    >
                      <BookOpen className="h-5 w-5" />
                    </a>
                    <a 
                      href="https://letterboxd.com/tfps" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white hover:scale-110 transition-transform duration-300"
                    >
                      <Star className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="glass-card p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h4 className="text-2xl font-semibold text-gray-900 mb-6">Quick Links</h4>
                <div className="space-y-4">
                  <a 
                    href="#about" 
                    className="block p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 group-hover:text-amber-600">About Us</span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </a>
                  <a 
                    href="#register" 
                    className="block p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 group-hover:text-amber-600">Register for Events</span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </a>
                  <Link 
                    to="/login" 
                    className="block p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 group-hover:text-amber-600">Member Login</span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-orange-600/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">TFPS</h3>
                  <p className="text-gray-400 text-sm">Technology Film and Photography Society</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering creativity through technology, fostering a community of passionate photographers and
                filmmakers.
              </p>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#about" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#register" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">
                    Register for Events
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">
                    Contact
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">
                    Member Login
                  </Link>
                </li>
              </ul>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h4 className="font-semibold mb-4 text-lg">Connect With Us</h4>
              <div className="text-gray-400 space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@tfps.edu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Student Activity Center</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/tfps.iitkgp/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.youtube.com/@TFPSIITKgp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a 
                  href="https://medium.com/@tfps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300"
                >
                  <BookOpen className="h-5 w-5" />
                </a>
                <a 
                  href="https://letterboxd.com/tfps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300"
                >
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
  delay: string
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
  <div 
    className="glass-card p-6 text-center hover-lift animate-fade-in group"
    style={{ animationDelay: delay }}
  >
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h4 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
      {title}
    </h4>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
)

export default HomePage
