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
  FileText // CORRECTED: Added the missing FileText import
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
              className="bg-[#2765FF] text-white px-6 py-2 rounded-lg hover:shadow-lg font-semibold"
            >
              Start For Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-black mb-6 leading-tight">
            Stop Applying.
            <span className="block text-[#2765FF] mt-2">
              Start Interviewing.
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our AI engine automates the entire job application process. Upload your CV, select your targets, and let us handle the hundreds of applications it takes to land your dream role.
          </p>
          
          <button
            onClick={onGetStarted}
            className="bg-[#2765FF] text-white px-8 py-4 rounded-xl text-lg font-semibold"
          >
            Automate My Job Search <ArrowRight className="inline-block w-5 h-5" />
          </button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-black mb-16">Get Interviews in 3 Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                <div>
                    <div className="w-20 h-20 bg-[#2765FF] rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Upload className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-4">1. Upload Your CV</h3>
                    <p className="text-gray-600">Submit your resume. Our AI analyzes your skills to build a perfect candidate profile.</p>
                </div>
                <div>
                    <div className="w-20 h-20 bg-[#03C03C] rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Target className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-4">2. Set Your Targets</h3>
                    <p className="text-gray-600">Our AI finds hundreds of ideal job matches. You just approve the targets.</p>
                </div>
                <div>
                    <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Send className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-4">3. We Apply For You</h3>
                    <p className="text-gray-600">The Bulk Apply Engine submits perfect applications to every approved target, 24/7.</p>
                </div>
            </div>
          </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-black mb-16">Your Unfair Advantage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <Zap className="w-8 h-8 text-[#2765FF] mb-4 mx-auto" />
                  <h3 className="text-xl font-bold text-black mb-3">The Bulk Apply Engine</h3>
                  <p className="text-gray-600">Apply to 100 jobs in the time it takes to do one.</p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <FileText className="w-8 h-8 text-[#2765FF] mb-4 mx-auto" />
                  <h3 className="text-xl font-bold text-black mb-3">AI Cover Letters</h3>
                  <p className="text-gray-600">Generate perfectly tailored cover letters for every application.</p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <BarChart3 className="w-8 h-8 text-[#2765FF] mb-4 mx-auto" />
                  <h3 className="text-xl font-bold text-black mb-3">Real-Time Analytics</h3>
                  <p className="text-gray-600">Track your success rate and optimize your strategy.</p>
              </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2765FF]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Stop Wasting Time. Start Getting Hired.</h2>
          <button
            onClick={onGetStarted}
            className="bg-white text-[#2765FF] px-8 py-4 rounded-xl text-lg font-semibold"
          >
            Start My Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
