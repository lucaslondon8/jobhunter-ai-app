// src/App.tsx

import React, { useState, useEffect } from 'react';
import { supabase, authService, profileService } from './lib/supabase';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetUser = async (authUser: any) => {
    try {
      // CRITICAL FIX: Fetch the full user profile from the database
      const profile = await profileService.getProfile();
      const userData = {
        id: authUser.id,
        name: profile?.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email,
        joinDate: authUser.created_at,
        // Ensure plan and limits are loaded correctly
        plan: profile?.plan || 'free',
        monthly_app_count: profile?.monthly_app_count || 0,
        monthly_app_limit: profile?.monthly_app_limit || 10,
      };
      setUser(userData);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to basic data if profile fetch fails
      setUser({ id: authUser.id, email: authUser.email, name: 'User', plan: 'free' });
    }
  };
  
  const checkSession = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchAndSetUser(session.user);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && (!user || session.user.id !== user.id)) {
        fetchAndSetUser(session.user);
      } else if (!session?.user && user) {
        setUser(null);
        setCurrentView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, [user]);

  const handleAuth = async (authedUser: any) => {
    await fetchAndSetUser(authedUser);
    setShowAuthModal(false);
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setUser(null);
    setCurrentView('landing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'landing' && (
        <LandingPage 
          onGetStarted={() => { setAuthMode('signup'); setShowAuthModal(true); }}
          onSignIn={() => { setAuthMode('signin'); setShowAuthModal(true); }}
        />
      )}
      
      {currentView === 'dashboard' && user && (
        <Dashboard user={user} onSignOut={handleSignOut} />
      )}

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onAuth={handleAuth}
          onModeSwitch={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
        />
      )}
    </div>
  );
}

export default App;
