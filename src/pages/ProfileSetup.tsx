import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, AtSign, FileText, Linkedin, Github, Globe, CheckCircle } from 'lucide-react';
import { auth, db, generateReferralCode } from '../lib/supabase';
import type { User as UserType } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ProfileSetup: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    linkedin: '',
    github: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (currentUser) {
        const { data: profile } = await db.getUserProfile(currentUser.id);
        setUser(profile);
        
        if (profile) {
          setFormData({
            full_name: profile.full_name || '',
            username: profile.username || '',
            bio: profile.bio || '',
            linkedin: profile.social_links?.linkedin || '',
            github: profile.social_links?.github || '',
            website: profile.social_links?.website || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data } = await db.getUserByUsername(username);
      setUsernameAvailable(!data || data.id === user?.id);
    } catch (error) {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'username') {
      const cleanUsername = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setFormData(prev => ({ ...prev, username: cleanUsername }));
      
      // Debounce username check
      setTimeout(() => {
        if (cleanUsername === formData.username) {
          checkUsernameAvailability(cleanUsername);
        }
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.username) {
      setError('Please fill in all required fields');
      return;
    }

    if (usernameAvailable === false) {
      setError('Username is not available');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');

      const profileData = {
        id: currentUser.id,
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        social_links: {
          linkedin: formData.linkedin,
          github: formData.github,
          website: formData.website
        }
      };

      let result;
      if (user) {
        // Profile exists, update it
        result = await db.updateUserProfile(currentUser.id, profileData);
      } else {
        // Profile doesn't exist, create it
        result = await db.insertProfile({
          ...profileData,
          upload_limit: 25,
          referral_code: generateReferralCode(),
          subscription_tier: 'free'
        });
      }
      
      if (result.error) throw result.error;

      setSuccess('Profile updated successfully!');
      
      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user?.full_name ? 'Edit Your Profile' : 'Complete Your Profile'}
            </h1>
            <p className="text-gray-600">
              {user?.full_name 
                ? 'Update your profile information and social links'
                : 'Set up your profile to start building your professional portfolio'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter your full name"
                icon={User}
                required
                fullWidth
              />

              <div>
                <Input
                  label="Username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Choose a unique username"
                  icon={AtSign}
                  required
                  fullWidth
                />
                {formData.username && (
                  <div className="mt-1 text-sm">
                    {checkingUsername && (
                      <span className="text-gray-500">Checking availability...</span>
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <span className="text-green-600">✓ Username available</span>
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <span className="text-red-600">✗ Username not available</span>
                    )}
                    {formData.username.length > 0 && formData.username.length < 3 && (
                      <span className="text-gray-500">Username must be at least 3 characters</span>
                    )}
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Your portfolio will be available at: skillvento.com/u/{formData.username || 'username'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself and your professional background..."
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Social Links (Optional)</h3>
              
              <Input
                label="LinkedIn Profile"
                type="url"
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                icon={Linkedin}
                fullWidth
              />

              <Input
                label="GitHub Profile"
                type="url"
                value={formData.github}
                onChange={(e) => handleInputChange('github', e.target.value)}
                placeholder="https://github.com/username"
                icon={Github}
                fullWidth
              />

              <Input
                label="Personal Website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                icon={Globe}
                fullWidth
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                fullWidth
              >
                {user?.full_name ? 'Cancel' : 'Skip for Now'}
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={!formData.full_name || !formData.username || usernameAvailable === false || checkingUsername}
                fullWidth
              >
                {user?.full_name ? 'Update Profile' : 'Complete Profile'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;