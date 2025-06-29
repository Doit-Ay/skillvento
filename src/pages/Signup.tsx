import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Award, Gift } from 'lucide-react';
import { auth, generateReferralCode } from '../lib/supabase';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/placeholders/LoadingSpinner';

const Signup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: referralCode
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateUsername = (fullName: string, email: string) => {
    const nameSlug = fullName.toLowerCase().replace(/\s+/g, '');
    const emailPrefix = email.split('@')[0];
    return nameSlug || emailPrefix;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPageLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      setPageLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      setPageLoading(false);
      return;
    }

    try {
      console.log('Starting signup process');
      const username = generateUsername(formData.fullName, formData.email);
      const userReferralCode = generateReferralCode();

      console.log('Generated username:', username);
      console.log('Generated referral code:', userReferralCode);

      const { error: signUpError } = await auth.signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        username: username,
        referral_code: userReferralCode,
        upload_limit: 25,
        subscription_tier: 'free',
        referred_by: formData.referralCode || null
      });
      
      if (signUpError) {
        console.error('Signup error:', signUpError);
        setError(signUpError.message);
        setPageLoading(false);
      } else {
        console.log('Signup successful, redirecting to dashboard');
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
      setPageLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    setError('');
    setPageLoading(true);

    try {
      console.log('Starting Google OAuth sign-in');
      const { error } = await auth.signInWithOAuth('google', formData.referralCode || referralCode);
      
      if (error) {
        console.error('Google sign-in error:', error);
        setError(error.message);
        setOauthLoading(false);
        setPageLoading(false);
      }
      // No need to navigate here as the OAuth flow will redirect automatically
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError('An unexpected error occurred. Please try again.');
      setOauthLoading(false);
      setPageLoading(false);
    }
  };

  if (pageLoading) {
    return <LoadingSpinner message="Creating your account..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 group mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Award className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Skillvento
            </span>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600">
            Start building your professional portfolio today
          </p>
        </div>

        {/* Referral Banner */}
        {referralCode && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <Gift className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-900">You've been invited!</p>
                <p className="text-xs text-green-700">Join with referral code: <span className="font-mono font-bold">{referralCode}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Full name"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              icon={User}
              required
              fullWidth
            />

            <Input
              label="Email address"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              icon={Mail}
              required
              fullWidth
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a password"
                icon={Lock}
                required
                fullWidth
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                icon={Lock}
                required
                fullWidth
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Referral Code Input */}
            <Input
              label="Referral Code (Optional)"
              type="text"
              value={formData.referralCode}
              onChange={(e) => handleInputChange('referralCode', e.target.value)}
              placeholder="Enter referral code from a friend"
              icon={Gift}
              helperText="Get bonus upload credits when you use a friend's referral code"
              fullWidth
            />

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
            >
              Create Account
            </Button>
          </form>

          {/* Google Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button 
                onClick={handleGoogleSignIn}
                disabled={oauthLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="ml-2">Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to={referralCode ? `/login?ref=${referralCode}` : "/login"}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;