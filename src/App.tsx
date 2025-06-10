import React from 'react';
import { Camera, Film, Users, Calendar, Award, Instagram, Youtube, Mail, Phone, MapPin, ChevronRight, ExternalLink, Play, Star, BookOpen } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-amber-400 rounded-full animate-float animation-delay-1000 opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-float animation-delay-2000 opacity-50"></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-orange-500 rounded-full animate-float opacity-30"></div>
      </div>

      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-0 rounded-none backdrop-blur-xl bg-gradient-to-r from-orange-500/90 to-amber-500/90">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="p-2 bg-white/20 rounded-xl shadow-lg backdrop-blur-md">
                <Camera className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">TFPS</h1>
                <p className="text-orange-100 text-sm">Technology Film & Photography Society</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-white hover:text-orange-200 transition-colors">About</a>
              <a href="#events" className="text-white hover:text-orange-200 transition-colors">Events</a>
              <a href="#gallery" className="text-white hover:text-orange-200 transition-colors">Gallery</a>
              <a href="#contact" className="text-white hover:text-orange-200 transition-colors">Contact</a>
            </nav>
            <div className="flex items-center gap-4">
              <button className="glass-button px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105">
                Join Us
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Enhanced 3D Camera */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-amber-600/20 animate-gradient"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in">
            <h2 className="text-8xl md:text-9xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              TFPS
            </h2>
            <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-light">Technology Film & Photography Society</p>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              IIT Kharagpur
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Where creativity meets technology. Join our vibrant community of photographers and filmmakers as we capture stories, create art, and push the boundaries of visual expression.
            </p>
          </div>

          {/* Enhanced 3D Camera with More Depth */}
          <div className="relative flex items-center justify-center my-20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {/* Backlight Effect */}
            <div className="backlight"></div>
            
            <div className="camera-3d">
              {/* Main Camera Body with enhanced depth */}
              <div className="camera-body">
                <div className="camera-lens"></div>
                {/* Camera Flash */}
                <div className="camera-flash"></div>
                {/* Camera Viewfinder */}
                <div className="camera-viewfinder"></div>
                {/* Camera Grip */}
                <div className="camera-grip"></div>
                {/* Camera Brand */}
                <div className="camera-brand"></div>
                {/* Additional details */}
                <div className="absolute top-3 right-6 w-4 h-4 bg-red-500 rounded-full shadow-lg transform translateZ-[12px]"></div>
                <div className="absolute bottom-6 left-6 w-10 h-3 bg-gray-600 rounded transform translateZ-[8px]"></div>
                <div className="absolute bottom-6 right-6 w-8 h-3 bg-gray-600 rounded transform translateZ-[8px]"></div>
                <div className="absolute top-6 left-6 w-6 h-6 bg-gray-700 rounded transform translateZ-[10px]"></div>
              </div>
            </div>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <button className="glass-button-primary px-8 py-4 rounded-xl font-medium text-lg hover:scale-105 transition-all duration-300 shadow-2xl">
              Explore Our Work
            </button>
          </div>
        </div>
      </section>

      {/* Recent Films Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
              Recent Films
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Watch our latest film productions and documentaries created by our talented members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real YouTube Videos */}
            <div className="glass-card group hover-lift animate-fade-in">
              <div className="relative">
                <div className="aspect-video bg-gray-900 relative overflow-hidden rounded-t-2xl">
                  <iframe
                    src="https://www.youtube.com/embed/Ekuy8Ymvk68"
                    title="TFPS Showreel 2024"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="absolute top-3 right-3 glass-button px-2 py-1 rounded-lg text-sm font-medium">
                  3:45
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">TFPS Showreel 2024</h4>
                <p className="text-gray-600 mb-4 leading-relaxed">A showcase of our best photography and cinematography work from 2024.</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Play className="h-4 w-4" />
                    2.3K views
                  </div>
                  <a href="https://youtube.com/watch?v=Ekuy8Ymvk68" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1 transition-colors">
                    Watch <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="glass-card group hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="aspect-video bg-gray-900 relative overflow-hidden rounded-t-2xl">
                  <iframe
                    src="https://www.youtube.com/embed/7Ay0bQemOs8"
                    title="Behind the Scenes"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="absolute top-3 right-3 glass-button px-2 py-1 rounded-lg text-sm font-medium">
                  5:20
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Behind the Scenes</h4>
                <p className="text-gray-600 mb-4 leading-relaxed">Get an inside look at how we create our stunning visual content.</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Play className="h-4 w-4" />
                    1.8K views
                  </div>
                  <a href="https://youtube.com/watch?v=7Ay0bQemOs8" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1 transition-colors">
                    Watch <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="glass-card group hover-lift animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="relative">
                <div className="aspect-video bg-gray-900 relative overflow-hidden rounded-t-2xl">
                  <iframe
                    src="https://www.youtube.com/embed/V3cechi6Ovk"
                    title="TFPS Documentary"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="absolute top-3 right-3 glass-button px-2 py-1 rounded-lg text-sm font-medium">
                  8:15
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">TFPS Documentary</h4>
                <p className="text-gray-600 mb-4 leading-relaxed">The story of TFPS and our journey in visual storytelling.</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Play className="h-4 w-4" />
                    4.1K views
                  </div>
                  <a href="https://youtube.com/watch?v=V3cechi6Ovk" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1 transition-colors">
                    Watch <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
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

      {/* Recent Instagram Posts Section */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
              Recent Instagram Posts
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Follow our journey through stunning photography and behind-the-scenes moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Real Instagram Embeds */}
            <div className="glass-card group hover-lift animate-fade-in">
              <div className="p-4">
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
                        <Instagram className="h-12 w-12 text-pink-500" />
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

            <div className="glass-card group hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="p-4">
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
                        <Instagram className="h-12 w-12 text-pink-500" />
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

            <div className="glass-card group hover-lift animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="p-4">
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
                        <Instagram className="h-12 w-12 text-pink-500" />
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

      {/* Recent Reviews Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
              Recent Reviews
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Read our thoughtful reviews and analyses on Medium and Letterboxd.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                platform: 'Medium', 
                title: 'The Art of Visual Storytelling in Modern Cinema', 
                author: 'Sarah Chen',
                excerpt: 'An in-depth analysis of how contemporary filmmakers use visual elements to enhance narrative...',
                readTime: '8 min read',
                url: 'https://medium.com/@sarahchen/visual-storytelling-modern-cinema',
                platformIcon: <BookOpen className="h-4 w-4" />,
                date: '3 days ago'
              },
              { 
                platform: 'Letterboxd', 
                title: 'Parasite: A Masterclass in Cinematography', 
                author: 'Alex Rodriguez',
                excerpt: 'Bong Joon-ho\'s visual composition creates a perfect metaphor for social inequality...',
                rating: 4.5,
                url: 'https://letterboxd.com/alexr/film/parasite-2019/',
                platformIcon: <Star className="h-4 w-4" />,
                date: '1 week ago'
              },
              { 
                platform: 'Medium', 
                title: 'Documentary Photography vs. Cinematic Truth', 
                author: 'Michael Park',
                excerpt: 'Exploring the fine line between documentary authenticity and artistic interpretation...',
                readTime: '12 min read',
                url: 'https://medium.com/@michaelpark/documentary-vs-cinematic-truth',
                platformIcon: <BookOpen className="h-4 w-4" />,
                date: '2 weeks ago'
              }
            ].map((review, index) => (
              <div 
                key={index} 
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
                    className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center gap-1 transition-colors"
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

      {/* Open Events Section */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
              Open Events
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Join our upcoming events and workshops open to everyone.
            </p>
          </div>

          <div className="space-y-8">
            {[1, 2].map((event, index) => (
              <EventCard key={event} event={event} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
              What We Offer
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              TFPS provides a comprehensive platform for photography and film enthusiasts to grow their skills and collaborate on projects.
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
              icon={<Award className="h-8 w-8" />}
              title="Competitions"
              description="Showcase your talent in our regular photography and filmmaking competitions."
              delay="0.6s"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-amber-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-amber-600/20 animate-gradient"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-5xl font-bold text-white mb-2">150+</div>
              <div className="text-orange-100 text-lg">Active Members</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-orange-100 text-lg">Equipment Items</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-5xl font-bold text-white mb-2">200+</div>
              <div className="text-orange-100 text-lg">Projects Completed</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="text-5xl font-bold text-white mb-2">25+</div>
              <div className="text-orange-100 text-lg">Awards Won</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-amber-600/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">TFPS</h3>
                  <p className="text-gray-400 text-sm">Technology Film & Photography Society</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering creativity through technology, fostering a community of passionate photographers and filmmakers at IIT Kharagpur.
              </p>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">About Us</a></li>
                <li><a href="#events" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">Events</a></li>
                <li><a href="#gallery" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">Gallery</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300">Contact</a></li>
              </ul>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h4 className="font-semibold mb-4 text-lg">Connect With Us</h4>
              <div className="text-gray-400 space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@tfps.iitkgp.ac.in</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>IIT Kharagpur</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/tfps.iitkgp/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://www.youtube.com/@TFPSIITKgp" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Technology Film & Photography Society, IIT Kharagpur. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
  <div 
    className="glass-card p-6 text-center hover-lift animate-fade-in group"
    style={{ animationDelay: delay }}
  >
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h4 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
      {title}
    </h4>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

interface EventCardProps {
  event: number;
  index: number;
}

const EventCard = ({ event, index }: EventCardProps) => {
  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Registration submitted successfully!');
    setShowForm(false);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div 
      className="glass-card overflow-hidden hover-lift animate-fade-in"
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Event Image */}
        <div className="aspect-video lg:aspect-square bg-gradient-to-br from-blue-200 to-purple-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/50 to-purple-400/50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-20 w-20 text-white opacity-80" />
          </div>
        </div>

        {/* Event Details */}
        <div className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Workshop
            </span>
            <span className="text-sm text-gray-500">March 15, 2024</span>
          </div>
          
          <h4 className="text-2xl font-bold text-gray-900 mb-4">
            Photography Workshop {event}
          </h4>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Join us for an intensive photography workshop covering composition, lighting, and post-processing techniques. Perfect for beginners and intermediate photographers looking to enhance their skills.
          </p>

          <div className="space-y-3 mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>March 15, 2024 • 2:00 PM - 6:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Photography Studio, IIT Kharagpur</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Limited to 20 participants</span>
            </div>
          </div>

          {!showForm ? (
            <button 
              onClick={() => setShowForm(true)}
              className="glass-button-primary px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all duration-300"
            >
              Register Now
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="glass-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="glass-input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Your Phone"
                  className="glass-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <textarea
                  placeholder="Any questions or special requirements?"
                  className="glass-input resize-none"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="glass-button-primary px-6 py-3 rounded-xl font-medium flex-1 hover:scale-105 transition-all duration-300"
                >
                  Submit Registration
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="glass-button px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
