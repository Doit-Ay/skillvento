import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  LogOut,
  Save,
  CheckCircle
} from 'lucide-react';
import { auth, db } from '../lib/supabase';
import Button from '../components/common/Button';
import ThemeSelector from '../components/portfolio/ThemeSelector';

const Settings: React.FC = () => {
  const { section = 'profile' } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [notificationPreferences, setNotificationPreferences] = useState({
    certificate_expiry: true,
    learning_recommendations: true,
    team_updates: true,
    platform_news: true
  });
  
  useEffect(() => {
    loadUserData();
  }, []);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      const { data: profile } = await db.getUserProfile(currentUser.id);
      setUser(profile);
      
      // Set notification preferences
      if (profile?.notification_preferences) {
        setNotificationPreferences(profile.notification_preferences);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const saveNotificationPreferences = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      
      await db.updateUserProfile(currentUser.id, {
        notification_preferences: notificationPreferences
      });
      
      setSuccess('Notification preferences saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving notification preferences:', err);
      setError(err.message || 'Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };
  
  const handleThemeChange = async (theme: string, layout?: string) => {
    try {
      setSuccess('Theme updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      // Update user state
      setUser(prev => ({
        ...prev,
        portfolio_theme: theme,
        portfolio_layout: layout || prev.portfolio_layout
      }));
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, href: '/settings/profile' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/settings/notifications' },
    { id: 'appearance', label: 'Appearance', icon: Palette, href: '/settings/appearance' },
    { id: 'security', label: 'Security', icon: Shield, href: '/settings/security' }
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                    {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{user?.full_name || user?.username}</h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-2">
                  {tabs.map(tab => (
                    <li key={tab.id}>
                      <a
                        href={tab.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                          section === tab.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <tab.icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </a>
                    </li>
                  ))}
                  
                  <li className="pt-4 mt-4 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center mb-6">
                <CheckCircle className="h-5 w-5 mr-2" />
                {success}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
                {error}
              </div>
            )}
            
            {section === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <User className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                </div>
                
                <p className="text-gray-600 mb-4">
                  Manage your profile information and public details.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-700">
                    To update your profile information, please visit the <a href="/profile" className="text-blue-600 underline">Profile page</a>.
                  </p>
                </div>
              </div>
            )}
            
            {section === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Bell className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Control which notifications you receive from Skillvento.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div>
                      <h3 className="font-medium text-gray-900">Certificate Expiry Alerts</h3>
                      <p className="text-sm text-gray-500">Receive notifications when your certificates are about to expire</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        id="certificate_expiry"
                        className="opacity-0 absolute w-0 h-0"
                        checked={notificationPreferences.certificate_expiry}
                        onChange={(e) => handleNotificationChange('certificate_expiry', e.target.checked)}
                      />
                      <label
                        htmlFor="certificate_expiry"
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                          notificationPreferences.certificate_expiry ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            notificationPreferences.certificate_expiry ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div>
                      <h3 className="font-medium text-gray-900">Learning Recommendations</h3>
                      <p className="text-sm text-gray-500">Receive personalized course and certification recommendations</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        id="learning_recommendations"
                        className="opacity-0 absolute w-0 h-0"
                        checked={notificationPreferences.learning_recommendations}
                        onChange={(e) => handleNotificationChange('learning_recommendations', e.target.checked)}
                      />
                      <label
                        htmlFor="learning_recommendations"
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                          notificationPreferences.learning_recommendations ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            notificationPreferences.learning_recommendations ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div>
                      <h3 className="font-medium text-gray-900">Team Updates</h3>
                      <p className="text-sm text-gray-500">Receive notifications about team activities and updates</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        id="team_updates"
                        className="opacity-0 absolute w-0 h-0"
                        checked={notificationPreferences.team_updates}
                        onChange={(e) => handleNotificationChange('team_updates', e.target.checked)}
                      />
                      <label
                        htmlFor="team_updates"
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                          notificationPreferences.team_updates ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            notificationPreferences.team_updates ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div>
                      <h3 className="font-medium text-gray-900">Platform News</h3>
                      <p className="text-sm text-gray-500">Receive updates about new features and platform changes</p>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                      <input
                        type="checkbox"
                        id="platform_news"
                        className="opacity-0 absolute w-0 h-0"
                        checked={notificationPreferences.platform_news}
                        onChange={(e) => handleNotificationChange('platform_news', e.target.checked)}
                      />
                      <label
                        htmlFor="platform_news"
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                          notificationPreferences.platform_news ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            notificationPreferences.platform_news ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={saveNotificationPreferences}
                    loading={saving}
                    icon={Save}
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
            
            {section === 'appearance' && (
              <div className="space-y-6">
                <ThemeSelector 
                  onThemeChange={handleThemeChange}
                  currentTheme={user?.portfolio_theme}
                  currentLayout={user?.portfolio_layout}
                />
              </div>
            )}
            
            {section === 'security' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Shield className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Manage your account security and privacy settings.
                </p>
                
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Change Password</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Update your password to keep your account secure.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/reset-password')}
                    >
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Certificate Privacy</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage which certificates are visible on your public profile.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                    >
                      Manage Certificates
                    </Button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Account Deletion</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Permanently delete your account and all associated data.
                    </p>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;