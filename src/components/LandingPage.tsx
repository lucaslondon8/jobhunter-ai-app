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
  Trophy,
  FileText
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
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-[#2765FF] text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-pearl to-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
              Apply to <span className="text-[#2765FF]">100+ Jobs</span><br />
              in <span className="text-[#03C03C]">10 Minutes</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The AI-powered job application platform that automates your entire job search. 
              Upload your CV, find perfect matches, and apply in bulk with personalized cover letters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-[#2765FF] to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all transform hover:scale-105"
              >
                Start Applying Now
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 transition-all">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-black mb-16">Your Unfair Advantage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all">
              <Zap className="w-12 h-12 text-[#2765FF] mb-6 mx-auto" />
              <h3 className="text-xl font-bold text-black mb-4">Bulk Apply Engine</h3>
              <p className="text-gray-600">Apply to 100 jobs in the time it takes to do one. Our AI handles forms, uploads CVs, and submits applications automatically.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all">
              <FileText className="w-12 h-12 text-[#2765FF] mb-6 mx-auto" />
              <h3 className="text-xl font-bold text-black mb-4">AI Cover Letters</h3>
              <p className="text-gray-600">Generate perfectly tailored cover letters for every application using advanced AI that understands job requirements.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all">
              <BarChart3 className="w-12 h-12 text-[#2765FF] mb-6 mx-auto" />
              <h3 className="text-xl font-bold text-black mb-4">Real-Time Analytics</h3>
              <p className="text-gray-600">Track your success rate, response times, and optimize your strategy with detailed performance insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-black mb-16">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#2765FF] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4">1. Upload Your CV</h3>
                <p className="text-gray-600">Our AI analyzes your CV to understand your skills, experience, and career goals.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#03C03C] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4">2. Find Perfect Matches</h3>
                <p className="text-gray-600">We search thousands of job boards to find positions that match your profile perfectly.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-4">3. Apply Automatically</h3>
                <p className="text-gray-600">Sit back while our AI applies to hundreds of jobs with personalized applications.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-[#2765FF] to-purple-600 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">Applications Sent</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2,500+</div>
              <div className="text-blue-100">Jobs Landed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10min</div>
              <div className="text-blue-100">Average Setup Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-black mb-6">Ready to Land Your Dream Job?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who've accelerated their job search with jobhunter ai.
          </p>
          <button 
            onClick={onGetStarted}
            className="bg-gradient-to-r from-[#2765FF] to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all transform hover:scale-105"
          >
            Get Started Free <ArrowRight className="w-5 h-5 inline ml-2" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-2xl font-bold text-[#2765FF]">jobhunter ai</span>
            </div>
            <p className="text-gray-400 mb-6">The future of job applications is here.</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;