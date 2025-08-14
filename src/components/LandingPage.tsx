// src/components/LandingPage.tsx

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
  // ... rest of the file is unchanged
  return (
    <div className="min-h-screen bg-pearl">
      {/* ... navigation and hero ... */}

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

      {/* ... rest of the file ... */}
    </div>
  );
};

export default LandingPage;
