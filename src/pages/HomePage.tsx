import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Users, 
  Calendar, 
  Mail, 
  MapPin, 
  Instagram, 
  ExternalLink, 
  Star, 
  BookOpen, 
  Youtube,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Film
} from 'lucide-react';

const HomePage = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const instagramScrollRef = useRef<HTMLDivElement>(null);
  const youtubeScrollRef = useRef<HTMLDivElement>(null);
  const recommendationsScrollRef = useRef<HTMLDivElement>(null);

  // Navigation sections
  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'current-event', label: 'Events' },
    { id: 'about', label: 'About' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'instagram', label: 'Instagram' }
  ];

  // Scroll functions
  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 320;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // YouTube videos data (6 videos)
  const youtubeVideos = [
    {
      id: 1,
      title: "NAKSHA | GC SFM 2025 | LBS HALL",
      youtubeId: "Ekuy8Ymvk68",
      description: "Two professional thieves brought together for an impossible heist. Will they overcome their differences?"
    },
    {
      id: 2,
      title: "CHANDRA | GC SFM 2025 | SNVH HALL",
      youtubeId: "7Ay0bQemOs8",
      description: "A story of tradition, identity, and unexpected connections that challenge everything."
    },
    {
      id: 3,
      title: "Before I Forget | Inter IIT Cultural Meet 6.0",
      youtubeId: "V3cechi6Ovk",
      description: "A musician's battle with Alzheimer's and the power of memories."
    },
    {
      id: 4,
      title: "TABLE FOR TWO | GC SFM 2025 | VS HALL",
      youtubeId: "a3o0spraCrM",
      description: "In this poignant short film, two former lovers unexpectedly reunite in a quiet café. What begins as an awkward encounter, gradually unfolds into a deeply emotional and reflective conversation..."
    },
    {
      id: 5,
      title: "NIYAT | GC SFM 2025 | Nehru Hall",
      youtubeId: "gTPzwS0oo9E",
      description: "An old woman in a peaceful village gives everything she owns to the man she brought up as her own. She takes a stand, however, and turns to the village panchayat for justice when care becomes..."
    },
    {
      id: 6,
      title: "PAARDARSH | GC SFM 2025 SILVER | LLR HALL",
      youtubeId: "QOP0CvqCQ_w",
      description: "In the 1990s, Anvesh, a college student exploring photography, is assigned a mysterious project by his professor, along with a vintage camera. Believing the project is about perception, he decides"
    }
  ];

  // Instagram posts data (6 posts)
  const instagramPosts = [
    {
      id: 1,
      image: "https://i.imgur.com/ewIlsUG.jpeg",
      caption: "The late night hustle, where the men and their tireless hands push against the night’s stillness.",
      postUrl: "https://www.instagram.com/p/DKjzVjJsU9B/?img_index=1"
    },
    {
      id: 2,
      image: "https://i.imgur.com/bUPnJHp.jpeg",
      caption: "Introducing our SILVER WINNING Photo story from the Online Photo Story Competition at Inter-IIT Cultural Meet 7.0! Theme- Over and Out",
      postUrl: "https://www.instagram.com/p/DJ9KYr3pp08/?img_index=1"
    },
    {
      id: 3,
      image: "https://i.imgur.com/19952oL.jpeg",
      caption: "Concrete Poetry🌃",
      postUrl: "https://www.instagram.com/p/DJtvbjnT1eS/"
    },
    {
      id: 4,
      image: "https://i.imgur.com/7p4kEJK.jpeg",
      caption: "Introducing one of our SILVER WINNING themes from the Street Photography Competition at Inter-IIT Cultural Meet 7.0! Theme(2/2) - Dream",
      postUrl: "https://www.instagram.com/p/DJJxu1-iBsg/?img_index=1"
    },
    {
      id: 5,
      image: "https://i.imgur.com/BpdJnpu.jpeg",
      caption: "Here's the next submission of our Photo-War: Murg Mussallam -A Photostory of Rebellion, Reflection, and Realisation.",
      postUrl: "https://www.instagram.com/p/DJJrLuqzozm/?img_index=1"
    },
    {
      id: 6,
      image: "https://i.imgur.com/Um69NAf.jpeg",
      caption: "Introducing one of our SILVER WINNING themes from the Street Photography Competition at Inter-IIT Cultural Meet 7.0! Theme(1/2) - Eye spy",
      postUrl: "https://www.instagram.com/p/DIgX9_aCe4Z/?img_index=12"
    }
  ];

  // Film recommendations data
  const filmRecommendations = [
    {
      id: 1,
      title: "Normal People",
      genre: "Drama",
      poster: "https://th.bing.com/th/id/OIP.mM_Aq2s3u_J_CgXNiYl7PQHaKe?rs=1&pid=ImgDetMain",
      reason: "Will ask Aryan Dagar once the website is released"
    },
    {
      id: 2,
      title: "Synecdoche, New York",
      genre: "Drama",
      poster: "https://alchetron.com/cdn/Synecdoche-New-York-images-6ad63b79-3016-4cc0-a4b6-0250b30cf3b.jpg",
      reason: "A movie thats so deeply personal all while being so universal- its insane. Surrealist and eerie and incredibly sad, but also surprisingly very funny.Such a deep, introspective and powerful movie on the human condition."
    },
    {
      id: 3,
      title: "Charulata",
      genre: "Romance",
      poster: "https://th.bing.com/th/id/OIP.zlhu4sxdSd1M5y8j8m9zLQAAAA?rs=1&pid=ImgDetMain",
      reason: "Better ask Afrin."
    },
    {
      id: 4,
      title: "The Grand Budapest Hotel",
      genre: "Comedy, Drama",
      poster: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=300",
      reason: "Wes Anderson's meticulous visual style and symmetrical compositions create a whimsical cinematic experience."
    },
    {
      id: 5,
      title: "Columbus",
      genre: "Drama",
      poster: "https://th.bing.com/th/id/OIP.AkJKVPz3aL8OfFRAMIRZtgHaLH?rs=1&pid=ImgDetMain",
      reason: "Beautiful breathable cinematography, a very simple and realistic storyline."
    },
    {
      id: 6,
      title: "Old Boy",
      genre: "Thriller, Action",
      poster: "https://assets-prd.ignimgs.com/2024/04/17/oldboy-button-1713392676941.jpg?width=300&auto=webp&dpr=2",
      reason: "Masterful cinematography and editing. Even the transitions were carefully placed. The twists make it entertaining, while being disgusting at the same time."
    }
  ];

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Intersection Observer for active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-orange-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse opacity-30"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TFPS</h1>
                <p className="text-xs text-gray-600">Technology Film & Photography Society</p>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-white/50 rounded-full p-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>

            {/* Login Button */}
            <button className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative py-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in">
            <h2 className="text-7xl font-bold mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              TFPS
            </h2>
            <p className="text-3xl text-gray-700 mb-4 font-light">Technology Film and Photography Society</p>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              We are a collective of passionate filmmakers, photographers and storytellers bonding over our shared love for expression and art.
              Through collaboration, we bend ideas into reality, shaping thoughts into frames.
            </p>
          </div>
        </div>
      </section>

      {/* Current Event Section */}
      <section id="current-event" className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Current Event
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Join our ongoing photography competition and showcase your creative vision.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-auto">
                  <img
                    src="https://i.imgur.com/0jN8AOw.png"
                    alt="Hometown Hues Photography Competition"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="mb-6">
                    <h4 className="text-3xl font-bold text-gray-900 mb-3">Hometown Hues</h4>
                    <p className="text-lg text-amber-600 font-medium mb-4">June 7-18th</p>
                  </div>

                  <div className="space-y-4 text-gray-600 leading-relaxed mb-8">
                    <p>HOMETOWN HUES is back for its 2nd edition with more hues and ways to tell your stories.</p>
                    <p>From chai stalls to quiet rooftops, from bustling sounds of streets to your grandfather's stories tell us everything that makes your Hometown special for you through the lens.</p>
                    <p className="font-medium text-gray-900">All lenses are welcome.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3">
                      <Camera className="h-5 w-5" />
                      Submit Your Entry
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button className="px-8 py-4 bg-white/50 backdrop-blur-md border border-orange-200 text-gray-700 rounded-xl font-medium hover:bg-white/70 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3">
                      <Instagram className="h-5 w-5" />
                      Follow for Updates
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section id="about" className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
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
              icon={<MessageCircle className="h-8 w-8" />}
              title="Movie Discussions"
              description="Engage in thoughtful discussions about films, techniques, and storytelling approaches."
            />
          </div>
        </div>
      </section>

      {/* Film Recommendations Section */}
      <section id="recommendations" className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Film Recommendations of the Month
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Curated picks from our film enthusiasts - movies that inspire and entertain through exceptional cinematography and storytelling.
            </p>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => scroll(recommendationsScrollRef, 'left')}
                  className="p-2 bg-white/70 backdrop-blur-md rounded-full shadow-lg hover:bg-white/90 transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => scroll(recommendationsScrollRef, 'right')}
                  className="p-2 bg-white/70 backdrop-blur-md rounded-full shadow-lg hover:bg-white/90 transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div
              ref={recommendationsScrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filmRecommendations.map((film) => (
                <div
                  key={film.id}
                  className="flex-none w-80 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden"
                >
                  <div className="relative h-48">
                    <img
                      src={film.poster}
                      alt={film.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-medium text-gray-700">
                        {film.genre}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{film.title}</h4>
                    <p className="text-gray-600 leading-relaxed text-sm">{film.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Section */}
      <section id="youtube" className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Latest YouTube Videos
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Watch our latest short film productions created by our talented members.
            </p>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => scroll(youtubeScrollRef, 'left')}
                  className="p-2 bg-white/70 backdrop-blur-md rounded-full shadow-lg hover:bg-white/90 transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => scroll(youtubeScrollRef, 'right')}
                  className="p-2 bg-white/70 backdrop-blur-md rounded-full shadow-lg hover:bg-white/90 transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <a
                href="https://www.youtube.com/@TFPSIITKgp"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Youtube className="h-5 w-5" />
                Subscribe
              </a>
            </div>

            <div
              ref={youtubeScrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {youtubeVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex-none w-80 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden"
                >
                  <div className="relative">
                    <div className="aspect-video bg-gray-900 relative overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-white text-sm font-medium">
                      {video.duration}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-white text-xs">
                      {video.views} views
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{video.description}</p>
                    <a
                      href={`https://youtube.com/watch?v=${video.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Youtube className="h-4 w-4" />
                      Watch on YouTube
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section id="instagram" className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Follow Us on Instagram
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Dive into the wild creativity of our photographers and discover the extraordinary world through their lens!
            </p>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => scroll(instagramScrollRef, 'left')}
                  className="p-2 bg-white/70 backdrop-blur-md rounded-full shadow-lg hover:bg-white/90 transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => scroll(instagramScrollRef, 'right')}
                  className="p-2 bg-white/70 backdrop-blur-md rounded-full shadow-lg hover:bg-white/90 transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <a
                href="https://www.instagram.com/tfps.iitkgp/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Instagram className="h-5 w-5" />
                Follow
              </a>
            </div>

            <div
              ref={instagramScrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {instagramPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex-none w-80 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={post.image}
                      alt="Instagram post"
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 mb-4 leading-relaxed text-sm line-clamp-2">{post.caption}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-red-500 text-red-500" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments}
                        </span>
                      </div>
                    </div>
                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Instagram className="h-4 w-4" />
                      Open on Instagram
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-orange-600/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
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
                Empowering creativity through technology, fostering a community of passionate photographers and filmmakers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-300"
                    >
                      {section.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
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
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-white/70 backdrop-blur-lg p-6 text-center rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 group">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h4 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">{title}</h4>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default HomePage;
