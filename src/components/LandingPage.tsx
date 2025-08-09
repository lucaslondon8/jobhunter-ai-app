import React from 'react';
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
  Trophy
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen bg-pearl">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#2765FF]" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>
                jobhunter ai
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onSignIn}
                className="text-gray-700 hover:text-electric-blue px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-electric-blue to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-electric-blue px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Trophy className="w-4 h-4" />
            <span className="text-[#2765FF]">10x Higher Success Rate</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight">
            Land Your Dream Job
            <span className="block text-4xl md:text-5xl font-bold text-[#2765FF] mt-2" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }}>
              10x Faster
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Upload your CV, let AI find perfect job matches, and apply to hundreds of positions in minutes. 
            Reduce application time by 95% while increasing your success rate exponentially.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={onGetStarted}
              className="bg-[#2765FF] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Start Applying Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-electric-blue hover:text-electric-blue transition-all">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <div className="text-3xl font-bold text-electric-blue mb-2">10x</div>
              <div className="text-gray-600">Higher Success Rate</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Time Reduction</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">50k+</div>
              <div className="text-gray-600">Jobs Applied</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">How jobhunter ai Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your job search and land your dream position
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-[#2765FF] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">1. Upload Your CV</h3>
              <p className="text-gray-600 leading-relaxed">
                Simply upload your resume and our AI will analyze your skills, experience, and career goals to optimize your profile.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">2. AI Finds Matches</h3>
              <p className="text-gray-600 leading-relaxed">
                Our intelligent algorithm scans thousands of job postings to find positions that perfectly match your profile and preferences.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Send className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">3. Bulk Apply</h3>
              <p className="text-gray-600 leading-relaxed">
                Apply to dozens of relevant positions with personalized cover letters and optimized applications, all in just one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-pearl to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to supercharge your job search and land your dream position
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {[
              {
                icon: Target,
                title: "Smart Job Matching",
                description: "AI-powered algorithm finds jobs that perfectly match your skills and experience"
              },
              {
                icon: Clock,
                title: "Time Optimization",
                description: "Reduce application time from hours to minutes with automated processes"
              },
              {
                icon: BarChart3,
                title: "Success Analytics",
                description: "Track your application success rate and optimize your strategy"
              },
              {
                icon: CheckCircle,
                title: "Application Tracking",
                description: "Monitor all your applications in one centralized dashboard"
              },
              {
                icon: Users,
                title: "Network Building",
                description: "Connect with recruiters and hiring managers in your industry"
              },
              {
                icon: Zap,
                title: "Instant Applications",
                description: "Apply to multiple positions simultaneously with one click"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-[#2765FF] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2765FF]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to 10x Your Job Search?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful job seekers who've transformed their careers with jobhunter ai
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-[#2765FF] px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center space-x-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}>jobhunter ai</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2025 jobhunter ai. All rights reserved. Supercharge your career today.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
