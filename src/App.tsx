import React from 'react';
import { Camera, Film, Users, Calendar, Award, Instagram, Youtube, Mail, Phone, MapPin, ChevronRight, ExternalLink } from 'lucide-react';

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

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-amber-600/20 animate-gradient"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in">
            <h2 className="text-7xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              TFPS
            </h2>
            <p className="text-3xl text-gray-700 mb-4 font-light">Technology Film & Photography Society</p>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              IIT Kharagpur
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Where creativity meets technology. Join our vibrant community of photographers and filmmakers as we capture stories, create art, and push the boundaries of visual expression.
            </p>
          </div>

          {/* 3D Camera and Film Roll Center Piece */}
          <div className="relative flex items-center justify-center my-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="camera-3d">
              {/* Main Camera Body */}
              <div className="camera-body animate-float">
                <div className="camera-lens"></div>
                {/* Camera details */}
                <div className="absolute top-2 right-4 w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-2 bg-gray-600 rounded"></div>
                <div className="absolute bottom-4 right-4 w-6 h-2 bg-gray-600 rounded"></div>
              </div>
            </div>

            {/* Film Rolls */}
            <div className="absolute -left-32 top-8 film-roll animate-float animation-delay-1000"></div>
            <div className="absolute -right-32 top-8 film-roll animate-float animation-delay-2000"></div>
            
            {/* Film Strip */}
            <div className="absolute -bottom-16 film-strip animate-pulse-slow"></div>
            
            {/* Additional decorative elements */}
            <div className="absolute -top-8 left-16 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce-slow"></div>
            <div className="absolute -top-8 right-16 w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-bounce-slow animation-delay-1000"></div>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <button className="glass-button-primary px-8 py-4 rounded-xl font-medium text-lg hover:scale-105 transition-all duration-300 shadow-2xl">
              Explore Our Work
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-16 bg-gradient-to-r from-orange-50 to-amber-50">
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

      {/* Gallery Preview Section */}
      <section id="gallery" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
              Our Work
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Explore some of our best photography and filmmaking projects created by our talented members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item, index) => (
              <div 
                key={item} 
                className="glass-card overflow-hidden hover-lift animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-video bg-gradient-to-br from-orange-200 to-amber-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/50 to-amber-400/50 group-hover:from-orange-500/60 group-hover:to-amber-500/60 transition-all duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="h-12 w-12 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Project {item}</h4>
                  <p className="text-gray-600 text-sm">A stunning visual story captured by our members.</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button className="glass-button-primary px-8 py-4 rounded-xl font-medium hover:scale-105 transition-all duration-300">
              View Full Gallery
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
                Get in Touch
              </h3>
              <p className="text-gray-600 text-lg">
                Have questions about joining TFPS or need more information? We'd love to hear from you!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="glass-card p-8 hover-lift animate-fade-in">
                <h4 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h4>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl">
                      <Mail className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700 font-medium">contact@tfps.iitkgp.ac.in</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl">
                      <Phone className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700 font-medium">+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700 font-medium">Student Activity Center, IIT Kharagpur</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h5 className="font-semibold text-gray-900 mb-4 text-lg">Follow Us</h5>
                  <div className="flex space-x-4">
                    <a href="#" className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:scale-110 transition-transform duration-300">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a href="#" className="p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:scale-110 transition-transform duration-300">
                      <Youtube className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="glass-card p-8 hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h4 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h4>
                <form className="space-y-6">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="glass-input"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Your Message"
                      rows={4}
                      className="glass-input resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="glass-button-primary w-full py-4 rounded-xl font-medium hover:scale-105 transition-all duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </div>
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
                <a href="#" className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white hover:scale-110 transition-all duration-300">
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

export default App;
