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
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-[#2765FF]">jobhunter ai</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onSignIn}
              className="text-gray-700 hover:text-electric-blue px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-[#2765FF] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
            >
              Start For Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-[#2765FF] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Trophy className="w-4 h-4" />
            <span>Double your interview rate. Guaranteed.</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-black mb-6 leading-tight">
            Stop Applying.
            <span className="block text-[#2765FF] mt-2">
              Start Interviewing.
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Our AI engine automates the entire job application process. Upload your CV, select your targets, and let us handle the hundreds of applications it takes to land your dream role. **Save 20+ hours a week and get in front of recruiters.**
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-[#2765FF] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Automate My Job Search</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Get Interviews in 3 Steps</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">From CV to interview request, completely on autopilot.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-[#2765FF] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">1. Upload Your CV</h3>
              <p className="text-gray-600 leading-relaxed">Submit your resume. Our AI analyzes your skills and experience to build a perfect candidate profile.</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-[#03C03C] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">2. Set Your Targets</h3>
              <p className="text-gray-600 leading-relaxed">Our AI finds hundreds of ideal job matches. You just approve the targets you want to pursue.</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Send className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">3. We Apply For You</h3>
              <p className="text-gray-600 leading-relaxed">The Bulk Apply Engine submits perfect, tailored applications to every approved target, 24/7.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Rewritten to focus on benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Your Unfair Advantage</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">The toolkit that gets you hired.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <Zap className="w-8 h-8 text-[#2765FF] mb-4" />
              <h3 className="text-xl font-bold text-black mb-3">The Bulk Apply Engine</h3>
              <p className="text-gray-600">Never manually fill out an application again. Apply to 100 jobs in the time it takes to do one.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <FileText className="w-8 h-8 text-[#2765FF] mb-4" />
              <h3 className="text-xl font-bold text-black mb-3">AI Cover Letters</h3>
              <p className="text-gray-600">Generate perfectly tailored cover letters for every single application, instantly.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <BarChart3 className="w-8 h-8 text-[#2765FF] mb-4" />
              <h3 className="text-xl font-bold text-black mb-3">Real-Time Analytics</h3>
              <p className="text-gray-600">Track your application success rate, identify what's working, and optimize your strategy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2765FF]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Stop Wasting Time. Start Getting Hired.</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Your next career move is one click away. Create your free account and let us do the work.</p>
          <button
            onClick={onGetStarted}
            className="bg-white text-[#2765FF] px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105"
          >
            Start My Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2025 jobhunter ai. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
