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
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Job Matching",
      description: "Our advanced AI analyzes your CV and matches you with jobs that fit your exact skills and experience level.",
      benefit: "10x better targeting",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "Automated Bulk Applications",
      description: "Apply to hundreds of jobs in minutes instead of spending hours on each application manually.",
      benefit: "95% time reduction",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FileText,
      title: "Personalized Cover Letters",
      description: "Generate unique, compelling cover letters for each application using advanced natural language processing.",
      benefit: "Professional quality",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Smart Analytics Dashboard",
      description: "Track your applications, response rates, and optimize your job search strategy with data-driven insights.",
      benefit: "Strategic optimization",
      color: "from-orange-500 to-red-500"
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "£0",
      period: "/month",
      weeklyPrice: "£0 / week",
      description: "The casual job browser",
      features: [
        "Full Capability AI CV Analysis",
        "10 AI Job Matches per day",
        "1 AI-Generated Cover Letter per day"
      ],
      cta: "Get Started Free",
      popular: false,
      color: "border-gray-200"
    },
    {
      name: "Pro",
      price: "£19.90",
      period: "/month",
      weeklyPrice: "£4.90/week",
      description: "The active job seeker who needs interviews now",
      features: [
        "Everything in Basic",
        "The Bulk Apply Engine",
        "Unlimited AI Job Matches",
        "10 AI-Generated Cover Letters per day",
        "Basic Progress Analytics"
      ],
      cta: "Start Pro Plan",
      popular: true,
      color: "border-blue-500 ring-2 ring-blue-500 ring-opacity-50",
      originalPrice: "£29",
      launchOffer: "Launch Offer: First 3 months",
      originalWeeklyPrice: "£9.90/week"
    },
    {
      name: "Plus+",
      price: "£39.90",
      period: "/month",
      weeklyPrice: "£12.90/week",
      description: "The ambitious candidate targeting competitive roles",
      features: [
        "Everything in Pro",
        "Unlimited AI-Generated Cover Letters",
        "Advanced Progress Analytics",
        "Refine job search strategy"
      ],
      cta: "Start Plus+ Plan",
      popular: false,
      color: "border-purple-500",
      originalPrice: "£49",
      launchOffer: "Launch Offer: First 3 months",
      originalWeeklyPrice: "£14.90/week"
    }
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
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">How It Works</a>
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
              <span className="text-sm font-semibold text-blue-800">Revolutionary AI-powered job application platform</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Land Your Dream Job
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                10x Faster
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform hours of manual applications into minutes of automated precision. 
              Our AI applies to hundreds of jobs while you sleep, with personalized cover letters 
              and intelligent matching that increases your odds by up to <span className="font-bold text-blue-600">10x</span>.
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

            {/* Value Props */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">95% Time Reduction</h3>
                <p className="text-gray-600 text-sm">Turn days of applications into minutes</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">10x Better Targeting</h3>
                <p className="text-gray-600 text-sm">AI matches you with perfect-fit roles</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Automated Excellence</h3>
                <p className="text-gray-600 text-sm">Professional applications 24/7</p>
              </div>
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
      <section id="how-it-works" className="py-24 bg-white">
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

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">Why Choose jobhunter ai?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your job search from a time-consuming chore into an automated success machine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Clock,
                title: "Save 40+ Hours Per Week",
                description: "Stop spending entire days filling out application forms. Our AI does it in minutes.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Target,
                title: "Higher Success Rates",
                description: "AI-powered matching ensures you only apply to jobs where you're a perfect fit.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: FileText,
                title: "Professional Quality",
                description: "Every application includes a personalized cover letter that sounds authentically you.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: BarChart3,
                title: "Data-Driven Insights",
                description: "Track what's working and optimize your strategy with detailed analytics.",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Your data is protected with bank-level encryption and security protocols.",
                color: "from-gray-500 to-gray-700"
              },
              {
                icon: Zap,
                title: "Lightning Fast Setup",
                description: "Get started in under 5 minutes. No complex configuration required.",
                color: "from-yellow-500 to-orange-500"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all group">
                <div className={`w-12 h-12 bg-gradient-to-r ${benefit.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent <span className="text-blue-600">Pricing</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your career goals. Start free, upgrade when you're ready to accelerate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-3xl p-8 border-2 ${plan.color} relative hover:shadow-2xl transition-all duration-300 ${plan.popular ? 'transform scale-105 shadow-xl' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    {plan.originalPrice && (
                      <div className="text-gray-400 line-through text-lg mb-1">{plan.originalPrice}</div>
                    )}
                    <span className={`text-5xl font-bold ${plan.popular ? 'text-blue-600' : plan.name === 'Plus+' ? 'text-purple-600' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <div className="text-gray-600 text-sm mb-4">{plan.weeklyPrice}</div>
                  {plan.launchOffer && (
                    <div className={`text-sm font-semibold mb-2 ${plan.popular ? 'text-blue-600' : 'text-purple-600'}`}>
                      {plan.launchOffer}
                    </div>
                  )}
                  {plan.originalWeeklyPrice && (
                    <div className="text-gray-400 line-through text-sm mb-2">{plan.originalWeeklyPrice}</div>
                  )}
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      {feature === 'Refine job search strategy' && plan.name === 'Plus+' ? (
                        <span className="text-purple-500 flex-shrink-0">⭐</span>
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={onGetStarted}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105' 
                      : plan.name === 'Plus+' 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg transform hover:scale-105'
                        : 'border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Stop wasting time on manual applications. Let our AI work 24/7 to land you interviews 
            while you focus on preparing for your dream job. The future of job searching is here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button 
              onClick={onGetStarted}
              className="group bg-white text-gray-900 px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-3"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:border-white/50 transition-all flex items-center justify-center space-x-3">
              <Calendar className="w-5 h-5" />
              <span>Book Demo</span>
            </button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 text-blue-200 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>7-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Cancel anytime</span>
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
                Revolutionary AI-powered job application platform. Transform your career with intelligent automation.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
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
            <p>&copy; 2024 jobhunter ai. All rights reserved. Built for ambitious professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;