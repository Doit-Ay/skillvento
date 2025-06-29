import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Award, AlertCircle, CheckCircle, Clock, X, Lock } from 'lucide-react';
import { auth } from '../../lib/supabase';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/placeholders/LoadingSpinner';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const adminAuth = localStorage.getItem('skillvento_admin_auth');
    if (adminAuth === 'admin123') {
      navigate('/admin11section/dashboard');
      return;
    }
    
    // Check for auth redirect from Google
    const checkForRedirect = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        try {
          // Handle the redirect - in a real app, you would validate the token
          // For demo purposes, we'll just set the admin auth
          localStorage.setItem('skillvento_admin_auth', 'admin123');
          navigate('/admin11section/dashboard');
        } catch (error) {
          console.error('Error handling redirect:', error);
        }
      }
      setPageLoading(false);
    };
    
    checkForRedirect();
  }, [navigate]);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginAttempts >= 3) {
      setError('Too many login attempts. Please try again later.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Validate email
      if (!email || !email.includes('@') || !email.includes('.')) {
        throw new Error('Please enter a valid email address');
      }
      
      // Check if email is authorized (in a real app, this would be a server-side check)
      if (email !== 'aditya2987ahir@gmail.com' && email !== 'admin@skillvento.com') {
        throw new Error('This email is not authorized for admin access');
      }
      
      // Send magic link using Supabase
      const { error: magicLinkError } = await auth.sendMagicLink(email);
      
      if (magicLinkError) {
        throw new Error(magicLinkError.message);
      }
      
      // Update state to show success message
      setMagicLinkSent(true);
      setLoginAttempts(prev => prev + 1);
      
    } catch (err: any) {
      setError(err.message || 'Failed to send login link');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      // Store a flag in localStorage to indicate this is an admin login attempt
      localStorage.setItem('admin_login_attempt', 'true');
      
      // Create a specific redirect URL for admin Google login
      const redirectUrl = `${window.location.origin}/admin11section/redirect`;
      
      // Use the signInWithOAuth method with the custom redirect URL
      const { error } = await auth.signInWithOAuth('google', '', {
        redirectTo: redirectUrl
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // The redirect will happen automatically
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  if (pageLoading) {
    return <LoadingSpinner message="Loading admin login..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 group mb-6">
            <div className="bg-white p-3 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-white">
              Skillvento Admin
            </span>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            Admin Login
          </h2>
          <p className="text-blue-100">
            Secure access to admin dashboard
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {magicLinkSent ? (
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Magic Link Sent!</h3>
              <p className="text-gray-600 mb-6">
                We've sent a secure login link to <strong>{email}</strong>. 
                Please check your email and click the link to log in.
              </p>
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700">
                      The login link will expire in 10 minutes. If you don't see the email, 
                      please check your spam folder.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setMagicLinkSent(false)}
                fullWidth
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start mb-6">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Login Button */}
              <div className="mb-6">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSendMagicLink} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Magic Link Login</h3>
                      <p className="text-xs text-blue-700 mt-1">
                        Enter your admin email to receive a secure login link. For security, links expire after 10 minutes.
                      </p>
                    </div>
                  </div>
                </div>

                <Input
                  label="Admin Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your admin email"
                  icon={Mail}
                  required
                  fullWidth
                />

                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  size="lg"
                >
                  Send Login Link
                </Button>
                
                <div className="text-center mt-4">
                  <a 
                    href="/admin11section"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    ← Back
                  </a>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;