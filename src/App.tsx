import React, { useState } from 'react';
import { supabase, authService } from './lib/supabase';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  React.useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await authService.getSession();
      if (session?.user) {
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email,
          joinDate: session.user.created_at,
          plan: 'free'
        };
        setUser(userData);
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = (userData: any) => {
    setUser(userData);
    setCurrentView('dashboard');
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    handleRealSignOut();
  };

  const handleRealSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setCurrentView('landing');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobhunter ai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'landing' && (
        <LandingPage 
          onGetStarted={() => {
            setAuthMode('signup');
            setShowAuthModal(true);
          }}
          onSignIn={() => {
            setAuthMode('signin');
            setShowAuthModal(true);
          }}
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
