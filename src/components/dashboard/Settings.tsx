// src/components/dashboard/Settings.tsx (Upgraded)

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase'; // Import supabase client
import { loadStripe } from '@stripe/stripe-js';
import { 
  User, Mail, Lock, Bell, Globe, CreditCard, Shield, Download,
  Trash2, Save, Eye, EyeOff, Link2, Zap
} from 'lucide-react';

// IMPORTANT: Add your Stripe publishable key to your .env file
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface SettingsProps {
  user: any;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  // ... other states

  // --- ADDED FOR BILLING ---
  const handleUpgradeClick = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');

      // Call your new Supabase function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        // IMPORTANT: Replace with your actual Stripe Price ID for the Pro plan
        body: JSON.stringify({ priceId: 'YOUR_STRIPE_PRO_PRICE_ID' }),
      });
      
      const { sessionId } = await response.json();
      if (!sessionId) throw new Error('Could not create checkout session');

      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error("Stripe Error:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'connections', label: 'Connections', icon: Link2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'billing':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Billing & Subscription</h3>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Current Plan</h4>
                  <p className="text-gray-600 capitalize">{user.plan} Plan</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {user.plan === 'free' ? '$0' : '$29'}
                  </div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>
              </div>
              
              {user.plan === 'free' && (
                <button 
                  onClick={handleUpgradeClick}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                  <span>Upgrade to Pro</span>
                </button>
              )}
            </div>
          </div>
        );
      // Other cases remain the same for brevity
      default:
        // Use the full code from the previous step for the other tabs
        return <div>Content for {activeTab}</div>;
    }
  };

  return (
     <div className="space-y-8">
      {/* ... (The full JSX for the Settings component, including tabs and save button) ... */}
      {renderContent()}
    </div>
  );
};

export default Settings;
