import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Target, 
  Clock, 
  Upload, 
  Search, 
  Send,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Users,
  Trophy,
  FileText,
  Star,
  Play,
  Shield,
  Rocket,
  TrendingUp,
  Award,
  Globe,
  Brain,
  Sparkles,
  ChevronDown,
  Quote,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  MousePointer,
  Briefcase,
  Coffee
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Software Engineer",
      company: "Google",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      quote: "I landed my dream job at Google in just 2 weeks. The AI-powered applications were incredibly targeted and professional.",
      results: "127 applications → 23 interviews → 5 offers"
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager",
      company: "Meta",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      quote: "The bulk application feature saved me 40+ hours per week. I went from 2 interviews per month to 15.",
      results: "200+ applications → 67% response rate"
    },
    {
      name: "Emily Watson",
      role: "Data Scientist",
      company: "Microsoft",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      quote: "The personalized cover letters were indistinguishable from ones I'd write myself. Absolutely game-changing.",
      results: "85% interview rate vs 12% industry average"
    }
  ];

  const companies = [
    { name: "Google", logo: "https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop" },
    { name: "Microsoft", logo: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop" },
    { name: "Meta", logo: "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop" },
    { name: "Amazon", logo: "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop" },
    { name: "Apple", logo: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop" },
    { name: "Netflix", logo: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=120&h=60&fit=crop" }
  ];

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description: "Our advanced AI analyzes your CV and matches you with jobs that fit your exact skills and experience level.",
      benefit: "Intelligent job targeting",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Bulk Application Engine",
      description: "Apply to 100+ jobs in minutes with our automated application system that handles forms and uploads.",
      benefit: "Massive time savings",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FileText,
      title: "Personalized Cover Letters",
      description: "Generate unique, compelling cover letters for each application using advanced natural language processing.",
      benefit: "Professional quality content",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Track your success metrics, optimize your strategy, and see exactly what's working in your job search.",
      benefit: "Strategic insights",
      color: "from-orange-500 to-red-500"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for testing the waters",
      features: [
        "10 applications per month",
        "Basic CV analysis",
        "Standard cover letters",
        "Email support"
      ],
      cta: "Start Free",
      popular: false,
      color: "border-gray-200"
    },
    {
      name: "Professional",
      price: "£29",
      period: "per month",
      description: "For serious job seekers",
      features: [
        "Unlimited applications",
        "Advanced AI matching",
        "Premium cover letters",
        "Priority support",
        "Analytics dashboard",
        "Interview preparation"
      ],
      cta: "Start 7-Day Free Trial",
      popular: true,
      color: "border-blue-500 ring-2 ring-blue-500"
    },
    {
      name: "Enterprise",
      price: "£99",
      period: "per month",
      description: "For career transformation",
      features: [
        "Everything in Professional",
        "Personal career coach",
        "LinkedIn optimization",
        "Salary negotiation guide",
        "1-on-1 strategy sessions",
        "White-glove service"
      ],
      cta: "Book Consultation",
      popular: false,
      color: "border-purple-200"
    }
  ];

  const stats = [
    { number: "127K+", label: "Applications Sent", icon: Send },
    { number: "15.2K+", label: "Jobs Landed", icon: Trophy },
    { number: "89%", label: "Success Rate", icon: Target },
    { number: "2.3min", label: "Average Setup", icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-100 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                jobhunter ai
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Success Stories</a>
              <button 
                onClick={onSignIn}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className={`max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">The future of job applications is here</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Land Your Dream Job
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                10x Faster
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Revolutionary AI-powered job application platform. Transform your job search with intelligent matching, 
              automated applications, and personalized cover letters. Built for the modern job seeker.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button 
                onClick={onGetStarted}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-3"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group border-2 border-gray-300 text-gray-700 px-10 py-5 rounded-2xl font-bold text-lg hover:border-gray-400 transition-all flex items-center justify-center space-x-3">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Advanced AI Technology</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Lightning Fast Setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-500 font-medium mb-12">Built for professionals targeting top companies</p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Tech Giants</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Startups</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Fortune 500</span>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Rocket className="w-8 h-8 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Scale-ups</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose jobhunter ai?</h2>
            <p className="text-blue-100 text-lg">Revolutionary technology meets proven job search strategies</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">AI-Powered</div>
              <div className="text-blue-100 font-medium">Smart Matching</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10x Faster</div>
              <div className="text-blue-100 font-medium">Application Speed</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">Precision</div>
              <div className="text-blue-100 font-medium">Job Targeting</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-blue-100 font-medium">Automated Work</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Revolutionary <span className="text-blue-600">Technology</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the next generation of job searching. Our advanced AI technology transforms 
              how professionals find and apply to their dream positions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer ${
                  hoveredFeature === index ? 'scale-105' : ''
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                <div className={`inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${feature.color} rounded-full text-white text-sm font-semibold`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{feature.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get hired in 3 simple steps. Our AI handles the heavy lifting while you focus on what matters.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  step: "01",
                  icon: Upload,
                  title: "Upload Your CV",
                  description: "Our advanced AI analyzes your CV, extracting skills, experience, and achievements to create your perfect job profile.",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  step: "02",
                  icon: Search,
                  title: "AI Finds Perfect Matches",
                  description: "We search thousands of job boards and use machine learning to find positions that match your exact profile and salary expectations.",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  step: "03",
                  icon: Send,
                  title: "Automated Applications",
                  description: "Sit back while our AI applies to hundreds of jobs with personalized cover letters and optimized applications.",
                  color: "from-green-500 to-emerald-500"
                }
              ].map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-8">
                    <div className={`w-24 h-24 bg-gradient-to-r ${step.color} rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg`}>
                      <step.icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Built for Success</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed by career experts and powered by cutting-edge AI technology to give you the competitive edge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-First Approach</h3>
              <p className="text-gray-600 leading-relaxed">
                Built from the ground up with artificial intelligence at its core. Every feature is designed to leverage machine learning for maximum effectiveness.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Enterprise Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Your data is protected with bank-level security. We use advanced encryption and follow strict privacy protocols to keep your information safe.
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Continuous Innovation</h3>
              <p className="text-gray-600 leading-relaxed">
                We're constantly improving our algorithms and adding new features. You'll always have access to the latest job search technology.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl text-gray-700 mb-6 leading-relaxed italic">
                "The technology behind jobhunter ai represents the future of career advancement. It's not just a tool—it's a competitive advantage."
              </blockquote>
              <div className="text-center">
                <div className="font-bold text-gray-900 text-lg">Career Technology Expert</div>
                <div className="text-gray-600">Industry Analysis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Alternative */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Launching Soon</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Be among the first to experience the future of job applications. Join our early access program and get exclusive benefits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="font-bold text-gray-900">Early Access</div>
              <div className="text-sm text-gray-600">Priority onboarding</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <div className="font-bold text-gray-900">Beta Features</div>
              <div className="text-sm text-gray-600">Latest innovations first</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <div className="font-bold text-gray-900">Special Pricing</div>
              <div className="text-sm text-gray-600">Founder's discount</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
              <Coffee className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <div className="font-bold text-gray-900">Direct Access</div>
              <div className="text-sm text-gray-600">Founder feedback line</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Updated messaging */}
      <section id="pricing" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Early Access <span className="text-blue-600">Pricing</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started with our launch pricing. Limited time offer for early adopters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 relative hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-600 mb-6">Perfect for testing the platform</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">Free</span>
                  <span className="text-gray-600 ml-2">forever</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">10 applications per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Basic CV analysis</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Standard cover letters</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Email support</span>
                </li>
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full py-4 rounded-2xl font-bold text-lg transition-all border-2 border-gray-300 text-gray-700 hover:border-gray-400"
              >
                Start Free
              </button>
            </div>
            
            <div className="bg-white rounded-3xl p-8 border-2 border-blue-500 ring-2 ring-blue-500 relative hover:shadow-2xl transition-all duration-300 transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                  Launch Special
                </div>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-600 mb-6">For serious job seekers</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">£29</span>
                  <span className="text-gray-600 ml-2">per month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited applications</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Advanced AI matching</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Premium cover letters</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Analytics dashboard</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Early access features</span>
                </li>
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full py-4 rounded-2xl font-bold text-lg transition-all bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105"
              >
                Start 7-Day Free Trial
              </button>
            </div>
            
            <div className="bg-white rounded-3xl p-8 border-2 border-purple-200 relative hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-6">For career transformation</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">£99</span>
                  <span className="text-gray-600 ml-2">per month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Everything in Professional</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Personal career coach</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">LinkedIn optimization</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Salary negotiation guide</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">1-on-1 strategy sessions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">White-glove service</span>
                </li>
              </ul>
              <button 
                onClick={onGetStarted}
                className="w-full py-4 rounded-2xl font-bold text-lg transition-all border-2 border-gray-300 text-gray-700 hover:border-gray-400"
              >
                Book Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Be among the first to experience revolutionary AI-powered job applications. 
            Join our early access program and transform your career with cutting-edge technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button 
              onClick={onGetStarted}
              className="group bg-white text-gray-900 px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-3"
            >
              <span>Join Early Access</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:border-white/50 transition-all flex items-center justify-center space-x-3">
              <Calendar className="w-5 h-5" />
              <span>Request Demo</span>
            </button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 text-blue-200 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Early access benefits</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Founder's pricing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Priority support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl font-bold">jobhunter ai</span>
              </div>
              <p className="text-gray-400 mb-6">
                Revolutionary AI job application platform. Built for the modern professional.
              </p>
              <div className="flex space-x-4">
                {/* Social icons would go here */}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 jobhunter ai. All rights reserved. Launching soon - Built for ambitious professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;