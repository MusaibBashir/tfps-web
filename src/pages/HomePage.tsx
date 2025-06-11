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

  // Recent movies
  const recentMovies = [
    {
      id: 1,
      title: "NAKSHA | GC SFM 2025 | LBS HALL",
      youtubeId: "Ekuy8Ymvk68",
      description: "We are well aware of the saying that 'opposites attract'. But is it really true all the time? Two professional thieves, are brought together to pull off an impossible heist. Both being polar opposite to each other, will they be able to put aside their differences? Will they make it possible or will it be their last heist?",
      duration: "3:45",
    },
    {
      id: 2,
      title: "CHANDRA | GC SFM 2025 | SNVH HALL",
      youtubeId: "7Ay0bQemOs8",
      description: "Chandra, an obedient girl raised to follow tradition, awaits her arranged marriage without question—until she meets Nisha, the groom's bold and free-spirited sister. Their growing bond stirs something unexpected in Chandra, forcing her to confront the limits of obedience, identity, and love. When tradition demands silence, will she choose her truth or turn away?",
      duration: "5:20",
    },
    {
      id: 3,
      title: "Before I Forget || Runner-up | Inter IIT Cultural Meet 6.0",
      youtubeId: "V3cechi6Ovk",
      description: "A once renowned musician grapples with the challenges of Alzheimer's disease, losing not only his memories but his music. His supportive wife, struggles with a profound question : Is he really the man she once fell in love with? As his grip on reality weakens, their memories become a portal to their past. Is he a merely the sum of his forgotten memories or there is something more to him?",
      duration: "8:15",
    },
  ]

  // Movie reviews from Medium and Letterboxd
  const movieReviews = [
    {
      id: 1,
      title: "The Cost of the Hollywood dream",
      platform: "Medium",
      author: "Manas Mehta",
      excerpt: "David Foster Wallace(great writer, do check out his essays) once described \"Lynchian\" as \"a particular kind of irony where the very macabre and the very mundane combine in such a way as to reveal the former's perpetual containment within the latter...",
      readTime: "8 min read",
      url: "https://manas1811.medium.com/the-cost-of-the-hollywood-dream-6e219d509645",
      platformIcon: <BookOpen className="h-4 w-4" />,
    },
    {
      id: 2,
      title: "Katiyabaaz Review",
      platform: "Letterboxd",
      author: "Rahul Ranwa",
      excerpt: "The editing shines like crazy, it was the best thing about this documentary so many unexpected match cuts. A matchstick cutting to sun, then water sprinklers, uff...So good.Cross cutting between Conversation and Use of B-rolls was peak, Great. Cinematography was dirty...",
      rating: 5,
      url: "https://boxd.it/9H08hX",
      platformIcon: <Star className="h-4 w-4" />,
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
                  <div className="flex items-center justify-end text-sm text-gray-500">
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
                </div>
              </blockquote>
            </div>

            {/* Instagram Post 2 */}
            <div className="glass-card p-4 hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <blockquote 
                className="instagram-media" 
                data-instgrm-permalink="https://www.instagram.com/p/DJ9KYr3pp08/?utm_source=ig_embed&utm_campaign=loading" 
                data-instgrm-version="14" 
                style={{ 
                  background: '#FFF', 
                  border: 0, 
                  borderRadius: '3px', 
                  boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)', 
                  margin: '1px', 
                  maxWidth: '540px', 
                  minWidth: '326px', 
                  padding: 0, 
                  width: '99.375%' 
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
                      <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg">
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
                    <div style={{ padding: '12.5% 0' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '14px', alignItems: 'center' }}>
                      <div>
                        <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', height: '12.5px', width: '12.5px', transform: 'translateX(0px) translateY(7px)' }}></div>
                        <div style={{ backgroundColor: '#F4F4F4', height: '12.5px', transform: 'rotate(-45deg) translateX(3px) translateY(1px)', width: '12.5px', flexGrow: 0, marginRight: '14px', marginLeft: '2px' }}></div>
                        <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', height: '12.5px', width: '12.5px', transform: 'translateX(9px) translateY(-18px)' }}></div>
                      </div>
                      <div style={{ marginLeft: '8px' }}>
                        <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', flexGrow: 0, height: '20px', width: '20px' }}></div>
                        <div style={{ width: 0, height: 0, borderTop: '2px solid transparent', borderLeft: '6px solid #f4f4f4', borderBottom: '2px solid transparent', transform: 'translateX(16px) translateY(-4px) rotate(30deg)' }}></div>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <div style={{ width: '0px', borderTop: '8px solid #F4F4F4', borderRight: '8px solid transparent', transform: 'translateY(16px)' }}></div>
                        <div style={{ backgroundColor: '#F4F4F4', flexGrow: 0, height: '12px', width: '16px', transform: 'translateY(-4px)' }}></div>
                        <div style={{ width: 0, height: 0, borderTop: '8px solid #F4F4F4', borderLeft: '8px solid transparent', transform: 'translateY(-4px) translateX(8px)' }}></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', marginBottom: '24px' }}>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', marginBottom: '6px', width: '224px' }}></div>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', width: '144px' }}></div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        </div>
      </section>

      {/* Current Event Section */}
      <section id="current-event" className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Current Event
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Join our ongoing photography competition and showcase your creative vision.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="glass-card overflow-hidden hover-lift animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative h-64 lg:h-auto">
                  <img
                    src="/posters/HometownHuesPoster.png"
                    alt="Hometown Hues Photography Competition"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Content Section */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="mb-6">
                    <h4 className="text-3xl font-bold text-gray-900 mb-3">Hometown Hues</h4>
                    <p className="text-lg text-amber-600 font-medium mb-4">June 7-15</p>
                  </div>

                  <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
                    <p>
                      HOMETOWN HUES is back for its 2nd edition with more hues and ways to tell your stories.
                    </p>
                    <p>
                      From chai stalls to quiet rooftops, from bustling sounds of streets to your grandfather's stories tell us everything that makes your Hometown special for you through the lens, be it your camera's or phone's.
                    </p>
                    <p>
                      📸 Submit your photos and videos at:
                    </p>
                    <p>
                      🔗 <a href="https://forms.gle/tJWG7f4fHfBPUPVt5" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-800 font-medium underline">https://forms.gle/tJWG7f4fHfBPUPVt5</a>
                    </p>
                    <p>
                      Top picks will be featured on TFPS's official Instagram handle.
                    </p>
                    <p>
                      So go on capturing people as much as the place.
                    </p>
                    <p className="font-medium text-gray-900">
                      All lenses are welcome.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="https://forms.gle/tJWG7f4fHfBPUPVt5"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-button-primary px-8 py-4 rounded-xl font-medium inline-flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300"
                    >
                      <Camera className="h-5 w-5" />
                      Submit Your Entry
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a
                      href="https://www.instagram.com/tfps.iitkgp/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-button-secondary px-8 py-4 rounded-xl font-medium inline-flex items-center justify-center gap-3 hover:scale-105 transition-all duration-300"
                    >
                      <Instagram className="h-5 w-5" />
                      Follow for Updates
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-16 relative">
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
                  <a href="#current-event" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">
                    Current Event
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
                  <span>tfps.iitkgp@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>IIT Kharagpur</span>
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
