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
  const [error, setError] = useState<string | null>(null);

  const fetchAndSetUser = async (authUser: any) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching user profile for:', authUser.id);
      
      // Try to get profile, but don't fail if it doesn't exist
      let profile = null;
      try {
        profile = await profileService.getProfile();
      } catch (profileError) {
        console.warn('Profile not found, will create basic user data:', profileError);
      }
      
      const userData = {
        id: authUser.id,
        name: profile?.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email,
        joinDate: authUser.created_at,
        plan: profile?.plan || 'free',
        monthly_app_count: 0,
        monthly_app_limit: 10,
      };
      
      console.log('User data prepared:', userData);
      setUser(userData);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
      // Create basic fallback user data
      const fallbackUser = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.email?.split('@')[0] || 'User',
        plan: 'free',
        joinDate: authUser.created_at
      };
      setUser(fallbackUser);
      setCurrentView('dashboard');
    }
    setIsLoading(false);
  };
  
  const checkSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Checking session...');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('Session found, fetching user data...');
        await fetchAndSetUser(session.user);
      } else {
        console.log('No session found');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setError('Session check failed');
      setIsLoading(false);
    }
  };
  
  const handleAuthStateChange = async (event: string, session: any) => {
    console.log('Auth state changed:', event, session?.user?.id);
    
    if (event === 'SIGNED_IN' && session?.user) {
      await fetchAndSetUser(session.user);
    } else if (event === 'SIGNED_OUT') {
      setUser(null);
      setCurrentView('landing');
      setError(null);
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (authedUser: any) => {
    console.log('Handling auth for user:', authedUser.id);
    await fetchAndSetUser(authedUser);
    setShowAuthModal(false);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setCurrentView('landing');
      setError(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out');
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>
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