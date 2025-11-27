import { useState, useEffect } from 'react';
import { Scale, Mail, Lock, User } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LoginPageProps {
  onLogin: (accessToken: string, user: any) => void;
  onContinueAsFree: () => void;
  // Optional prop to set initial mode when opening LoginPage from Welcome screen
  initialIsSignUp?: boolean;
  // Optional back handler to return to the welcome screen
  onBack?: () => void;
}

export function LoginPage({ onLogin, onContinueAsFree, initialIsSignUp = false, onBack }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a76efa1a/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password, name })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Auto sign in after signup
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      if (signInData.session?.access_token) {
        onLogin(signInData.session.access_token, signInData.user);
      }

    } catch (err: any) {
      console.error('Signup error:', err);
      const errorMessage = err.message || 'Failed to sign up';
      
      // User-friendly error messages
      if (errorMessage.includes('already been registered')) {
        setError('This email is already registered. Please sign in instead.');
        // Auto-switch to sign in mode after 2 seconds
        setTimeout(() => {
          setIsSignUp(false);
          setError('');
        }, 2000);
      } else if (errorMessage.includes('Password')) {
        setError('Password must be at least 6 characters long.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      if (data.session?.access_token) {
        onLogin(data.session.access_token, data.user);
      }

    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  // Support opening login page with a specific mode (sign up) and back navigation
  useEffect(() => {
    setIsSignUp(Boolean(initialIsSignUp));
  }, [initialIsSignUp]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white w-full">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <Scale className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-gray-900 mb-2">JusticeConnect</h1>
        <p className="text-sm text-gray-600 text-center mb-8">
          Philippine Law AI Assistant
        </p>

        {/* Back Button + Form */}
        { /* Show a back link to return to the welcome screen when provided */ }
        {onBack && (
          <div className="w-full mb-3 text-left">
            <button
              onClick={onBack}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {'< Back'}
            </button>
          </div>
        )}
        <div className="w-full bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                !isSignUp 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                isSignUp 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm text-gray-700 mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>
        </div>

        {/* Continue as Free */}
        <button
          onClick={onContinueAsFree}
          className="w-full py-3 text-blue-600 hover:text-blue-700 transition-colors"
        >
          Continue for Free (Limited Features)
        </button>

        <p className="text-xs text-gray-500 text-center mt-6 px-4">
          Free mode: Chat history and advanced features disabled
        </p>
      </div>
    </div>
  );
}