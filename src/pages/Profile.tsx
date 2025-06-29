import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  AtSign, 
  FileText, 
  Linkedin, 
  Github, 
  Globe, 
  CheckCircle,
  Save,
  Eye,
  Edit3,
  GraduationCap,
  Briefcase,
  Award,
  Settings,
  Camera,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Calendar,
  Building
} from 'lucide-react';
import { auth, db, generateReferralCode } from '../lib/supabase';
import type { User as UserType } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

interface ContactInfo {
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

interface AcademicInfo {
  id?: string;
  degree: string;
  institution: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  grade: string;
  description: string;
  is_current: boolean;
}

interface ProfessionalExperience {
  id?: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  skills: string[];
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'professional' | 'social'>('personal');
  const [formData, setFormData] = useState({
    // Personal Info
    full_name: '',
    username: '',
    bio: '',
    email: '',
    
    // Social Links
    linkedin: '',
    github: '',
    website: '',
    twitter: ''
  });
  
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  });
  
  const [academicInfo, setAcademicInfo] = useState<AcademicInfo[]>([]);
  const [professionalExperience, setProfessionalExperience] = useState<ProfessionalExperience[]>([]);
  
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
        // Load profile
        const { data: profile } = await db.getUserProfile(currentUser.id);
        setUser(profile);
        
        if (profile) {
          setFormData({
            full_name: profile.full_name || '',
            username: profile.username || '',
            bio: profile.bio || '',
            email: currentUser.email || '',
            linkedin: profile.social_links?.linkedin || '',
            github: profile.social_links?.github || '',
            website: profile.social_links?.website || '',
            twitter: profile.social_links?.twitter || ''
          });
        }
        
        // Load contact info
        const { data: contact } = await db.getContactInfo(currentUser.id);
        if (contact) {
          setContactInfo(contact);
        }
        
        // Load academic info
        const { data: academic } = await db.getAcademicInfo(currentUser.id);
        setAcademicInfo(academic || []);
        
        // Load professional experience
        const { data: experience } = await db.getProfessionalExperience(currentUser.id);
        setProfessionalExperience(experience || []);
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

  const handleContactChange = (field: string, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const addAcademicInfo = () => {
    setAcademicInfo(prev => [...prev, {
      degree: '',
      institution: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      grade: '',
      description: '',
      is_current: false
    }]);
  };

  const updateAcademicInfo = (index: number, field: string, value: string | boolean) => {
    setAcademicInfo(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeAcademicInfo = async (index: number) => {
    const item = academicInfo[index];
    if (item.id) {
      await db.deleteAcademicInfo(item.id);
    }
    setAcademicInfo(prev => prev.filter((_, i) => i !== index));
  };

  const addProfessionalExperience = () => {
    setProfessionalExperience(prev => [...prev, {
      title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      skills: []
    }]);
  };

  const updateProfessionalExperience = (index: number, field: string, value: string | boolean | string[]) => {
    setProfessionalExperience(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeProfessionalExperience = async (index: number) => {
    const item = professionalExperience[index];
    if (item.id) {
      await db.deleteProfessionalExperience(item.id);
    }
    setProfessionalExperience(prev => prev.filter((_, i) => i !== index));
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

      // Update profile
      const updateData = {
        full_name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        social_links: {
          linkedin: formData.linkedin,
          github: formData.github,
          website: formData.website,
          twitter: formData.twitter
        }
      };

      let result;
      if (user) {
        result = await db.updateUserProfile(currentUser.id, updateData);
      } else {
        result = await db.insertProfile({
          id: currentUser.id,
          ...updateData,
          upload_limit: 25,
          referral_code: generateReferralCode(),
          subscription_tier: 'free'
        });
      }
      
      if (result.error) throw result.error;

      // Update contact info
      await db.upsertContactInfo(currentUser.id, contactInfo);

      // Update academic info
      for (const academic of academicInfo) {
        if (academic.id) {
          await db.updateAcademicInfo(academic.id, academic);
        } else if (academic.degree && academic.institution) {
          await db.insertAcademicInfo({
            user_id: currentUser.id,
            ...academic
          });
        }
      }

      // Update professional experience
      for (const experience of professionalExperience) {
        if (experience.id) {
          await db.updateProfessionalExperience(experience.id, experience);
        } else if (experience.title && experience.company) {
          await db.insertProfessionalExperience({
            user_id: currentUser.id,
            ...experience
          });
        }
      }

      setSuccess('Profile updated successfully!');
      
      // Reload user data
      setTimeout(() => {
        loadUserData();
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'academic', label: 'Academic', icon: GraduationCap },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'social', label: 'Social Links', icon: Globe }
  ];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const TabIcon = currentTab?.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Management</h1>
              <p className="text-gray-600">
                Manage your personal information, academic background, and professional details
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {user?.username && (
                <Button
                  variant="outline"
                  icon={Eye}
                  onClick={() => window.open(`/u/${user.username}`, '_blank')}
                >
                  Preview Portfolio
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              {/* Profile Summary */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-3">
                    <span className="text-white text-2xl font-bold">
                      {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-50 transition-colors duration-200">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900">{user?.full_name || 'Complete your profile'}</h3>
                <p className="text-sm text-gray-500">@{user?.username || 'username'}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  {TabIcon && (
                    <TabIcon className="h-6 w-6 mr-2 text-blue-600" />
                  )}
                  {currentTab?.label}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center mb-6">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {success}
                  </div>
                )}

                {/* Personal Info Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-6">
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
                          </div>
                        )}
                      </div>

                      <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        icon={Mail}
                        disabled
                        fullWidth
                      />

                      <Input
                        label="Phone"
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => handleContactChange('phone', e.target.value)}
                        placeholder="Your phone number"
                        icon={Phone}
                        fullWidth
                      />

                      <Input
                        label="Address"
                        type="text"
                        value={contactInfo.address}
                        onChange={(e) => handleContactChange('address', e.target.value)}
                        placeholder="Street address"
                        icon={MapPin}
                        fullWidth
                      />

                      <Input
                        label="City"
                        type="text"
                        value={contactInfo.city}
                        onChange={(e) => handleContactChange('city', e.target.value)}
                        placeholder="City"
                        fullWidth
                      />

                      <Input
                        label="State/Province"
                        type="text"
                        value={contactInfo.state}
                        onChange={(e) => handleContactChange('state', e.target.value)}
                        placeholder="State or Province"
                        fullWidth
                      />

                      <Input
                        label="Country"
                        type="text"
                        value={contactInfo.country}
                        onChange={(e) => handleContactChange('country', e.target.value)}
                        placeholder="Country"
                        fullWidth
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  </div>
                )}

                {/* Academic Tab - FIXED VISIBILITY */}
                {activeTab === 'academic' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Academic Information</h3>
                      <Button size="sm" icon={Plus} onClick={addAcademicInfo} type="button">
                        Add Education
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {academicInfo.map((academic, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeAcademicInfo(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Degree"
                              value={academic.degree}
                              onChange={(e) => updateAcademicInfo(index, 'degree', e.target.value)}
                              placeholder="e.g., Bachelor of Science"
                              fullWidth
                            />
                            <Input
                              label="Institution"
                              value={academic.institution}
                              onChange={(e) => updateAcademicInfo(index, 'institution', e.target.value)}
                              placeholder="University name"
                              fullWidth
                            />
                            <Input
                              label="Field of Study"
                              value={academic.field_of_study}
                              onChange={(e) => updateAcademicInfo(index, 'field_of_study', e.target.value)}
                              placeholder="e.g., Computer Science"
                              fullWidth
                            />
                            <Input
                              label="Grade/GPA"
                              value={academic.grade}
                              onChange={(e) => updateAcademicInfo(index, 'grade', e.target.value)}
                              placeholder="e.g., 3.8/4.0"
                              fullWidth
                            />
                            <Input
                              label="Start Date"
                              type="date"
                              value={academic.start_date}
                              onChange={(e) => updateAcademicInfo(index, 'start_date', e.target.value)}
                              fullWidth
                            />
                            <Input
                              label="End Date"
                              type="date"
                              value={academic.end_date}
                              onChange={(e) => updateAcademicInfo(index, 'end_date', e.target.value)}
                              disabled={academic.is_current}
                              fullWidth
                            />
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex items-center mb-4">
                              <input
                                type="checkbox"
                                checked={academic.is_current}
                                onChange={(e) => updateAcademicInfo(index, 'is_current', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 text-sm text-gray-700">
                                Currently studying here
                              </label>
                            </div>
                            
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={academic.description}
                              onChange={(e) => updateAcademicInfo(index, 'description', e.target.value)}
                              rows={3}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Describe your studies, achievements, etc."
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {academicInfo.length === 0 && (
                      <div className="text-center py-8">
                        <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No academic information added yet.</p>
                        <p className="text-sm text-gray-500">Click "Add Education" to get started.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Professional Tab - FIXED VISIBILITY */}
                {activeTab === 'professional' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Professional Experience</h3>
                      <Button size="sm" icon={Plus} onClick={addProfessionalExperience} type="button">
                        Add Experience
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {professionalExperience.map((experience, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeProfessionalExperience(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Job Title"
                              value={experience.title}
                              onChange={(e) => updateProfessionalExperience(index, 'title', e.target.value)}
                              placeholder="e.g., Software Engineer"
                              fullWidth
                            />
                            <Input
                              label="Company"
                              value={experience.company}
                              onChange={(e) => updateProfessionalExperience(index, 'company', e.target.value)}
                              placeholder="Company name"
                              fullWidth
                            />
                            <Input
                              label="Location"
                              value={experience.location}
                              onChange={(e) => updateProfessionalExperience(index, 'location', e.target.value)}
                              placeholder="City, Country"
                              fullWidth
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                label="Start Date"
                                type="date"
                                value={experience.start_date}
                                onChange={(e) => updateProfessionalExperience(index, 'start_date', e.target.value)}
                                fullWidth
                              />
                              <Input
                                label="End Date"
                                type="date"
                                value={experience.end_date}
                                onChange={(e) => updateProfessionalExperience(index, 'end_date', e.target.value)}
                                disabled={experience.is_current}
                                fullWidth
                              />
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex items-center mb-4">
                              <input
                                type="checkbox"
                                checked={experience.is_current}
                                onChange={(e) => updateProfessionalExperience(index, 'is_current', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 text-sm text-gray-700">
                                Currently working here
                              </label>
                            </div>
                            
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={experience.description}
                              onChange={(e) => updateProfessionalExperience(index, 'description', e.target.value)}
                              rows={3}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Describe your responsibilities and achievements..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {professionalExperience.length === 0 && (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No professional experience added yet.</p>
                        <p className="text-sm text-gray-500">Click "Add Experience" to get started.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Social Links Tab */}
                {activeTab === 'social' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                      <Input
                        label="Twitter Profile"
                        type="url"
                        value={formData.twitter}
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                        placeholder="https://twitter.com/username"
                        icon={AtSign}
                        fullWidth
                      />
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Social Media Tips</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Make sure your profiles are professional and up-to-date</li>
                        <li>• Use consistent usernames across platforms when possible</li>
                        <li>• Include links to your best work and projects</li>
                        <li>• These links will be displayed on your public portfolio</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!formData.full_name || !formData.username || usernameAvailable === false || checkingUsername}
                    icon={Save}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;