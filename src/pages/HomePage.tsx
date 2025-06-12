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
  ArrowRight,
  Scroll,
} from "lucide-react"

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Recent movies data
  const recentMovies = [
    {
      id: 1,
      title: "NAKSHA",
      subtitle: "GC SFM 2025 | LBS HALL",
      youtubeId: "Ekuy8Ymvk68",
      description: "Two professional thieves, polar opposites, brought together for an impossible heist. Will they overcome their differences or will this be their last job?",
      duration: "3:45",
      image: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      id: 2,
      title: "CHANDRA",
      subtitle: "GC SFM 2025 | SNVH HALL",
      youtubeId: "7Ay0bQemOs8",
      description: "An obedient girl awaiting arranged marriage meets her groom's free-spirited sister, forcing her to confront tradition, identity, and love.",
      duration: "5:20",
      image: "https://images.pexels.com/photos/7991225/pexels-photo-7991225.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      id: 3,
      title: "BEFORE I FORGET",
      subtitle: "Runner-up | Inter IIT Cultural Meet 6.0",
      youtubeId: "V3cechi6Ovk",
      description: "A renowned musician battles Alzheimer's, losing memories and music. His wife questions: is he still the man she fell in love with?",
      duration: "8:15",
      image: "https://images.pexels.com/photos/7991464/pexels-photo-7991464.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
  ]

  const slides = [
    {
      id: 1,
      title: "Capturing",
      subtitle: "Stories Through",
      highlight: "Technology",
      description: "Where creativity meets innovation in visual storytelling",
      images: [
        "https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=800"
      ]
    },
    {
      id: 2,
      title: "Film &",
      subtitle: "Photography",
      highlight: "Society",
      description: "Empowering creative minds through collaborative excellence",
      images: [
        "https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=800"
      ]
    },
    {
      id: 3,
      title: "Visual",
      subtitle: "Excellence",
      highlight: "Redefined",
      description: "Pushing boundaries in cinematography and photography",
      images: [
        "https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=800"
      ]
    }
  ]

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setTimeout(() => setIsAnimating(false), 2500)
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        nextSlide()
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [isAnimating])

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAnimating])

  return (
    <div className="min-h-screen bg-black text-white font-light overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-8">
        <div className="flex items-center justify-between">
          {/* Left Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="#" className="nav-link group">
              <span className="relative">
                Films
                <span className="nav-underline"></span>
              </span>
            </Link>
            <Link to="#" className="nav-link group">
              <span className="relative">
                Photography
                <span className="nav-underline"></span>
              </span>
            </Link>
            <Link to="#" className="nav-link group active">
              <span className="relative">
                Society
                <span className="nav-underline active"></span>
              </span>
            </Link>
          </div>

          {/* Center Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2">
              <Camera className="h-6 w-6" />
              <span className="text-lg font-medium tracking-wider">TFPS</span>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="#" className="nav-link group">
              <span className="relative">
                Contact
                <span className="nav-underline"></span>
              </span>
            </Link>
            <Link to="/login" className="nav-link group">
              <span className="relative flex items-center space-x-2">
                <span>Login</span>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs">
                  0
                </div>
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Slider */}
      <div className="relative h-screen">
        {/* Background Canvas Area */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>

        {/* Slide Content */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Images */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-8">
                {slide.images.map((image, imgIndex) => (
                  <div
                    key={imgIndex}
                    className={`relative w-80 h-96 overflow-hidden transform transition-all duration-1000 ${
                      index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                    }`}
                    style={{ 
                      transitionDelay: `${imgIndex * 100}ms`,
                      transform: imgIndex === 0 ? 'translateY(-2rem)' : 'translateY(2rem)'
                    }}
                  >
                    <img
                      src={image}
                      alt={`${slide.title} ${imgIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Text Content */}
            <div className="absolute bottom-32 left-16 z-10">
              <div className="overflow-hidden">
                <div
                  className={`transform transition-all duration-1000 ${
                    index === currentSlide ? 'translate-y-0' : 'translate-y-full'
                  }`}
                >
                  <h1 className="text-6xl font-light mb-2 tracking-wide">
                    {slide.title}
                  </h1>
                </div>
              </div>
              <div className="overflow-hidden">
                <div
                  className={`transform transition-all duration-1000 delay-200 ${
                    index === currentSlide ? 'translate-y-0' : 'translate-y-full'
                  }`}
                >
                  <h2 className="text-6xl font-light mb-2 tracking-wide">
                    {slide.subtitle}
                  </h2>
                </div>
              </div>
              <div className="overflow-hidden">
                <div
                  className={`transform transition-all duration-1000 delay-400 ${
                    index === currentSlide ? 'translate-y-0' : 'translate-y-full'
                  }`}
                >
                  <h3 className="text-6xl font-light mb-4 tracking-wide">
                    {slide.highlight}
                  </h3>
                </div>
              </div>
              <div className="overflow-hidden">
                <div
                  className={`transform transition-all duration-1000 delay-600 ${
                    index === currentSlide ? 'translate-y-0' : 'translate-y-full'
                  }`}
                >
                  <p className="text-lg text-gray-300 max-w-md">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Navigation */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20">
          <div className="space-y-8">
            {slides.map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <span className={`text-sm transition-all duration-300 ${
                  index === currentSlide ? 'text-white' : 'text-gray-500'
                }`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className={`h-px transition-all duration-500 ${
                  index === currentSlide ? 'w-8 bg-white' : 'w-4 bg-gray-600'
                }`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Scroll className="h-4 w-4" />
            <span>Scroll</span>
          </div>
        </div>

        {/* Vertical Text */}
        <div className="absolute bottom-8 right-8 z-20">
          <div className="transform rotate-90 origin-bottom-right">
            <span className="text-sm tracking-widest text-gray-400 uppercase">
              Technology Film &<br />Photography Society
            </span>
          </div>
        </div>
      </div>

      {/* Recent Films Section */}
      <section className="min-h-screen bg-black py-20">
        <div className="container mx-auto px-16">
          <div className="mb-16">
            <h2 className="text-5xl font-light mb-4 tracking-wide">Recent Films</h2>
            <p className="text-gray-400 text-lg max-w-2xl">
              Explore our latest cinematic creations and visual narratives crafted by our talented community.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {recentMovies.map((movie, index) => (
              <div key={movie.id} className="group cursor-pointer">
                <div className="relative overflow-hidden mb-6">
                  <div className="aspect-[4/5] bg-gray-900">
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 text-xs">
                    {movie.duration}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="h-6 w-6 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-light tracking-wide">{movie.title}</h3>
                  <p className="text-gray-400 text-sm uppercase tracking-wider">{movie.subtitle}</p>
                  <p className="text-gray-300 leading-relaxed">{movie.description}</p>
                  
                  <div className="flex items-center justify-between pt-4">
                    <a
                      href={`https://youtube.com/watch?v=${movie.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors group/link"
                    >
                      <span className="text-sm tracking-wide">Watch Film</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <a
              href="https://www.youtube.com/@TFPSIITKgp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 border border-white/20 px-8 py-4 hover:bg-white hover:text-black transition-all duration-300 group"
            >
              <Youtube className="h-5 w-5" />
              <span className="tracking-wide">View All Films</span>
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="min-h-screen bg-gray-900 py-20">
        <div className="container mx-auto px-16">
          <div className="mb-16">
            <h2 className="text-5xl font-light mb-4 tracking-wide">Follow Our Journey</h2>
            <p className="text-gray-400 text-lg max-w-2xl">
              Stay connected with our creative process and behind-the-scenes moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="aspect-square bg-black/50 flex items-center justify-center">
              <Instagram className="h-12 w-12 text-gray-600" />
            </div>
            <div className="aspect-square bg-black/50 flex items-center justify-center">
              <Instagram className="h-12 w-12 text-gray-600" />
            </div>
            <div className="aspect-square bg-black/50 flex items-center justify-center">
              <Instagram className="h-12 w-12 text-gray-600" />
            </div>
          </div>

          <div className="text-center">
            <a
              href="https://www.instagram.com/tfps.iitkgp/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 border border-white/20 px-8 py-4 hover:bg-white hover:text-black transition-all duration-300 group"
            >
              <Instagram className="h-5 w-5" />
              <span className="tracking-wide">@tfps.iitkgp</span>
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-16">
        <div className="container mx-auto px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Camera className="h-6 w-6" />
                <span className="text-lg font-medium tracking-wider">TFPS</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Technology Film and Photography Society - Where creativity meets innovation in visual storytelling.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-light mb-6 tracking-wide">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">About</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">Events</a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">Member Login</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-light mb-6 tracking-wide">Connect</h4>
              <div className="space-y-3 text-gray-400 mb-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4" />
                  <span>tfps.iitkgp@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4" />
                  <span>IIT Kharagpur</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/tfps.iitkgp/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.youtube.com/@TFPSIITKgp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Technology Film and Photography Society. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
