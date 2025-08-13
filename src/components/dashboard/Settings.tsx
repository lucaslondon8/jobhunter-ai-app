// src/components/dashboard/Settings.tsx (Final Version)

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  User, Mail, Lock, Bell, CreditCard, Shield, Save, Link2, Zap
} from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface SettingsProps {
  user: any;
}

const CheckoutForm: React.FC<SettingsProps> = ({ user }) => {
  const stripe = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('billing');
  const [linkedinCookie, setLinkedinCookie] = useState('');

  const handleUpgradeClick = async (priceId: string) => {
    if (!stripe) return;
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });
      
      const { sessionId, error } = await response.json();
      if (error) throw new Error(error.message);
      if (!sessionId) throw new Error('Could not create checkout session');

      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'connections', label: 'Connections', icon: Link2 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const renderContent = () => {
    // ... (Your existing renderContent switch statement for tabs)
    // For brevity, only the billing tab is shown here, but include all of them.
    switch (activeTab) {
      case 'billing':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Billing & Subscription</h3>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border">
              <h4 className="text-lg font-semibold">Current Plan: <span className="text-blue-600 capitalize">{user.plan}</span></h4>
              {user.plan === 'free' && (
                <button 
                  onClick={() => handleUpgradeClick('YOUR_PRO_PRICE_ID')}
                  disabled={isLoading}
                  className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-semibold"
                >
                  {isLoading ? 'Processing...' : 'Upgrade to Pro'}
                </button>
              )}
            </div>
          </div>
        );
      default:
        return <div>Content for {activeTab}</div>
    }
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 text-center">Settings</h1>
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

const Settings: React.FC<SettingsProps> = (props) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm {...props} />
  </Elements>
);

export default Settings;
