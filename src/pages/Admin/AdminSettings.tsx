import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Database, 
  Server, 
  Shield, 
  Mail, 
  CreditCard, 
  Globe,
  LogOut,
  AlertTriangle,
  CheckCircle,
  X,
  Users,
  Award,
  FileText,
  Lock,
  Bell,
  RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'email' | 'payment' | 'advanced'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Skillvento',
    siteDescription: 'Your AI-powered growth portfolio and certificate vault',
    maxUploadSize: '10',
    defaultUploadLimit: '25',
    enableReferrals: true,
    enablePublicProfiles: true
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    enableTwoFactor: true,
    passwordMinLength: '8',
    sessionTimeout: '24',
    allowSocialLogin: true,
    requireEmailVerification: false
  });
  
  const [emailSettings, setEmailSettings] = useState({
    fromEmail: 'noreply@skillvento.com',
    supportEmail: 'support@skillvento.com',
    enableWelcomeEmail: true,
    enableDigestEmail: true,
    digestFrequency: 'weekly'
  });
  
  const [paymentSettings, setPaymentSettings] = useState({
    currency: 'INR',
    freeTrial: '0',
    enableSubscriptions: true,
    enableOneTimePayments: false,
    taxRate: '18'
  });
  
  const [advancedSettings, setAdvancedSettings] = useState({
    logLevel: 'info',
    maintenanceMode: false,
    debugMode: false,
    enableCaching: true,
    storageProvider: 'supabase',
    backupFrequency: 'daily'
  });
  
  useEffect(() => {
    // Check if admin is logged in
    const adminAuth = localStorage.getItem('skillvento_admin_auth');
    if (adminAuth !== 'admin123') {
      navigate('/admin11section');
      return;
    }
    
    // Simulate loading settings from API
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [navigate]);
  
  const handleSaveSettings = () => {
    setIsSaving(true);
    setError('');
    
    // Validate settings
    if (activeTab === 'general') {
      if (!generalSettings.siteName) {
        setError('Site name is required');
        setIsSaving(false);
        return;
      }
      
      if (parseInt(generalSettings.maxUploadSize) <= 0) {
        setError('Max upload size must be greater than 0');
        setIsSaving(false);
        return;
      }
    }
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1500);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('skillvento_admin_auth');
    navigate('/admin11section');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Settings</h1>
                <p className="text-gray-600 text-sm">Configure platform settings</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/admin11section/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                Dashboard
              </Link>
              <Link to="/admin11section/analytics" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                Analytics
              </Link>
              <Button
                variant="outline"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>{error}</span>
            <button 
              onClick={() => setError('')} 
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                <p className="text-sm text-gray-600 mt-1">Manage platform configuration</p>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveTab('general')}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        activeTab === 'general'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Globe className="h-5 w-5" />
                      <span className="font-medium">General</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('security')}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        activeTab === 'security'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Shield className="h-5 w-5" />
                      <span className="font-medium">Security</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('email')}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        activeTab === 'email'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Mail className="h-5 w-5" />
                      <span className="font-medium">Email</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('payment')}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        activeTab === 'payment'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <CreditCard className="h-5 w-5" />
                      <span className="font-medium">Payment</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('advanced')}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        activeTab === 'advanced'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Server className="h-5 w-5" />
                      <span className="font-medium">Advanced</span>
                    </button>
                  </li>
                </ul>
              </nav>
              
              {/* System Status */}
              <div className="p-4 mt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Database</span>
                    </div>
                    <span className="text-xs text-green-600">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Storage</span>
                    </div>
                    <span className="text-xs text-green-600">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Auth</span>
                    </div>
                    <span className="text-xs text-green-600">Operational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">API</span>
                    </div>
                    <span className="text-xs text-green-600">Operational</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 flex items-center">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeTab === 'general' && 'General Settings'}
                  {activeTab === 'security' && 'Security Settings'}
                  {activeTab === 'email' && 'Email Settings'}
                  {activeTab === 'payment' && 'Payment Settings'}
                  {activeTab === 'advanced' && 'Advanced Settings'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {activeTab === 'general' && 'Configure basic platform settings'}
                  {activeTab === 'security' && 'Manage security and authentication options'}
                  {activeTab === 'email' && 'Configure email notifications and templates'}
                  {activeTab === 'payment' && 'Manage payment gateways and subscription settings'}
                  {activeTab === 'advanced' && 'Advanced configuration options'}
                </p>
              </div>
              
              <div className="p-6">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Site Name"
                        value={generalSettings.siteName}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                        fullWidth
                      />
                      
                      <Input
                        label="Site Description"
                        value={generalSettings.siteDescription}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                        fullWidth
                      />
                      
                      <Input
                        label="Maximum Upload Size (MB)"
                        type="number"
                        value={generalSettings.maxUploadSize}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, maxUploadSize: e.target.value })}
                        fullWidth
                      />
                      
                      <Input
                        label="Default Upload Limit"
                        type="number"
                        value={generalSettings.defaultUploadLimit}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, defaultUploadLimit: e.target.value })}
                        helperText="Number of certificates free users can upload"
                        fullWidth
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="enableReferrals"
                          type="checkbox"
                          checked={generalSettings.enableReferrals}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, enableReferrals: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="enableReferrals" className="ml-2 block text-sm text-gray-900">
                          Enable referral system
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="enablePublicProfiles"
                          type="checkbox"
                          checked={generalSettings.enablePublicProfiles}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, enablePublicProfiles: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="enablePublicProfiles" className="ml-2 block text-sm text-gray-900">
                          Enable public user profiles
                        </label>
                      </div>
                    </div>
                    
                    {/* Platform Stats */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 flex items-center">
                          <Users className="h-8 w-8 text-blue-600 mr-3" />
                          <div>
                            <div className="text-sm text-blue-700">Total Users</div>
                            <div className="text-xl font-bold text-blue-900">
                              {localStorage.getItem('total_users') || '5'}
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 flex items-center">
                          <Award className="h-8 w-8 text-green-600 mr-3" />
                          <div>
                            <div className="text-sm text-green-700">Total Certificates</div>
                            <div className="text-xl font-bold text-green-900">
                              {localStorage.getItem('total_certificates') || '12'}
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 flex items-center">
                          <FileText className="h-8 w-8 text-purple-600 mr-3" />
                          <div>
                            <div className="text-sm text-purple-700">Storage Used</div>
                            <div className="text-xl font-bold text-purple-900">
                              {localStorage.getItem('storage_used') || '24.5 MB'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Minimum Password Length"
                        type="number"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })}
                        icon={Lock}
                        fullWidth
                      />
                      
                      <Input
                        label="Session Timeout (hours)"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                        fullWidth
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="enableTwoFactor"
                          type="checkbox"
                          checked={securitySettings.enableTwoFactor}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, enableTwoFactor: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="enableTwoFactor" className="ml-2 block text-sm text-gray-900">
                          Enable two-factor authentication
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="allowSocialLogin"
                          type="checkbox"
                          checked={securitySettings.allowSocialLogin}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, allowSocialLogin: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="allowSocialLogin" className="ml-2 block text-sm text-gray-900">
                          Allow social login (Google, GitHub)
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="requireEmailVerification"
                          type="checkbox"
                          checked={securitySettings.requireEmailVerification}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, requireEmailVerification: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-900">
                          Require email verification
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              Changing security settings may affect user access. Make sure to communicate changes to your users.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Security Audit Log */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Security Events</h3>
                      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Admin Login</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">admin@skillvento.com</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">192.168.1.1</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">10 minutes ago</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Failed Login Attempt</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">user@example.com</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">203.0.113.1</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2 hours ago</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">Password Reset</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">john.doe@example.com</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">198.51.100.1</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Yesterday</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Email Settings */}
                {activeTab === 'email' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="From Email"
                        type="email"
                        value={emailSettings.fromEmail}
                        onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                        icon={Mail}
                        fullWidth
                      />
                      
                      <Input
                        label="Support Email"
                        type="email"
                        value={emailSettings.supportEmail}
                        onChange={(e) => setEmailSettings({ ...emailSettings, supportEmail: e.target.value })}
                        icon={Mail}
                        fullWidth
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="enableWelcomeEmail"
                          type="checkbox"
                          checked={emailSettings.enableWelcomeEmail}
                          onChange={(e) => setEmailSettings({ ...emailSettings, enableWelcomeEmail: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="enableWelcomeEmail" className="ml-2 block text-sm text-gray-900">
                          Send welcome email to new users
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="enableDigestEmail"
                          type="checkbox"
                          checked={emailSettings.enableDigestEmail}
                          onChange={(e) => setEmailSettings({ ...emailSettings, enableDigestEmail: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="enableDigestEmail" className="ml-2 block text-sm text-gray-900">
                          Send activity digest emails
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Digest Email Frequency
                      </label>
                      <select
                        value={emailSettings.digestFrequency}
                        onChange={(e) => setEmailSettings({ ...emailSettings, digestFrequency: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    {/* Email Templates Preview */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Email Templates</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                            <h4 className="font-medium text-gray-700">Welcome Email</h4>
                          </div>
                          <div className="p-4">
                            <div className="bg-blue-50 rounded-lg p-3 mb-3">
                              <div className="text-sm text-blue-800 font-medium">Subject: Welcome to Skillvento!</div>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p className="mb-2">Hello [User],</p>
                              <p className="mb-2">Welcome to Skillvento! We're excited to have you join our community of professionals showcasing their achievements.</p>
                              <p className="mb-2">Get started by uploading your first certificate...</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-end">
                            <button className="text-blue-600 text-sm font-medium">Edit Template</button>
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                            <h4 className="font-medium text-gray-700">Weekly Digest</h4>
                          </div>
                          <div className="p-4">
                            <div className="bg-blue-50 rounded-lg p-3 mb-3">
                              <div className="text-sm text-blue-800 font-medium">Subject: Your Weekly Skillvento Update</div>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p className="mb-2">Hello [User],</p>
                              <p className="mb-2">Here's what happened on Skillvento this week:</p>
                              <p className="mb-2">- [X] new certificates were uploaded</p>
                              <p className="mb-2">- [Y] new users joined the platform</p>
                            </div>
                          </div>
                          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-end">
                            <button className="text-blue-600 text-sm font-medium">Edit Template</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Email Templates</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>
                              You can customize email templates in the Email Templates section.
                            </p>
                          </div>
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-300 text-blue-700 hover:bg-blue-100"
                            >
                              Manage Email Templates
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Payment Settings */}
                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Currency
                        </label>
                        <select
                          value={paymentSettings.currency}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, currency: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="INR">Indian Rupee (₹)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                          <option value="GBP">British Pound (£)</option>
                        </select>
                      </div>
                      
                      <Input
                        label="Free Trial Period (days)"
                        type="number"
                        value={paymentSettings.freeTrial}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, freeTrial: e.target.value })}
                        helperText="0 for no free trial"
                        fullWidth
                      />
                      
                      <Input
                        label="Tax Rate (%)"
                        type="number"
                        value={paymentSettings.taxRate}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, taxRate: e.target.value })}
                        fullWidth
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="enableSubscriptions"
                          type="checkbox"
                          checked={paymentSettings.enableSubscriptions}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, enableSubscriptions: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="enableSubscriptions" className="ml-2 block text-sm text-gray-900">
                          Enable subscription payments
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="enableOneTimePayments"
                          type="checkbox"
                          checked={paymentSettings.enableOneTimePayments}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, enableOneTimePayments: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="enableOneTimePayments" className="ml-2 block text-sm text-gray-900">
                          Enable one-time payments
                        </label>
                      </div>
                    </div>
                    
                    {/* Subscription Plans */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Subscription Plans</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Plus}
                        >
                          Add Plan
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">Starter Plan</h4>
                              <p className="text-sm text-gray-600">10 certificate uploads</p>
                            </div>
                            <div className="text-lg font-bold text-gray-900">₹100</div>
                          </div>
                          <div className="flex justify-end">
                            <button className="text-blue-600 text-sm font-medium">Edit</button>
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">Professional Plan</h4>
                              <p className="text-sm text-gray-600">20 certificate uploads</p>
                            </div>
                            <div className="text-lg font-bold text-gray-900">₹200</div>
                          </div>
                          <div className="flex justify-end">
                            <button className="text-blue-600 text-sm font-medium">Edit</button>
                          </div>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">Business Plan</h4>
                              <p className="text-sm text-gray-600">30 certificate uploads</p>
                            </div>
                            <div className="text-lg font-bold text-gray-900">₹300</div>
                          </div>
                          <div className="flex justify-end">
                            <button className="text-blue-600 text-sm font-medium">Edit</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CreditCard className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-purple-800">Payment Gateways</h3>
                          <div className="mt-2 text-sm text-purple-700">
                            <p>
                              Configure payment gateways in the Payment Gateways section.
                            </p>
                          </div>
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-300 text-purple-700 hover:bg-purple-100"
                            >
                              Manage Payment Gateways
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Advanced Settings */}
                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Caution: Advanced Settings</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>
                              Changes to these settings can significantly impact the platform. Proceed with caution.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Database Settings</h3>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Database Backups</div>
                            <div className="text-sm text-gray-600">Automatic daily backups are enabled</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Database}
                          >
                            Configure Backups
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Settings</h3>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Storage Provider</div>
                            <div className="text-sm text-gray-600">Currently using: {advancedSettings.storageProvider}</div>
                          </div>
                          <select
                            value={advancedSettings.storageProvider}
                            onChange={(e) => setAdvancedSettings({ ...advancedSettings, storageProvider: e.target.value })}
                            className="block w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="supabase">Supabase Storage</option>
                            <option value="s3">Amazon S3</option>
                            <option value="gcs">Google Cloud Storage</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Maintenance Mode</h3>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Maintenance Mode</div>
                            <div className="text-sm text-gray-600">
                              {advancedSettings.maintenanceMode 
                                ? 'Site is currently in maintenance mode' 
                                : 'Site is currently live and accessible'}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-3 text-sm font-medium text-gray-900">
                              {advancedSettings.maintenanceMode ? 'On' : 'Off'}
                            </span>
                            <button 
                              className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none ${
                                advancedSettings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setAdvancedSettings({ 
                                ...advancedSettings, 
                                maintenanceMode: !advancedSettings.maintenanceMode 
                              })}
                            >
                              <span 
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  advancedSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              ></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">System Logs</h3>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Log Level</div>
                            <div className="text-sm text-gray-600">Currently set to: {advancedSettings.logLevel.toUpperCase()}</div>
                          </div>
                          <select
                            value={advancedSettings.logLevel}
                            onChange={(e) => setAdvancedSettings({ ...advancedSettings, logLevel: e.target.value })}
                            className="block w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="debug">DEBUG</option>
                            <option value="info">INFO</option>
                            <option value="warn">WARN</option>
                            <option value="error">ERROR</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Cache Settings</h3>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Enable Caching</div>
                            <div className="text-sm text-gray-600">
                              {advancedSettings.enableCaching 
                                ? 'Caching is enabled for better performance' 
                                : 'Caching is disabled'}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-3 text-sm font-medium text-gray-900">
                              {advancedSettings.enableCaching ? 'On' : 'Off'}
                            </span>
                            <button 
                              className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none ${
                                advancedSettings.enableCaching ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setAdvancedSettings({ 
                                ...advancedSettings, 
                                enableCaching: !advancedSettings.enableCaching 
                              })}
                            >
                              <span 
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  advancedSettings.enableCaching ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              ></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Debug Mode</h3>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Debug Mode</div>
                            <div className="text-sm text-gray-600">
                              {advancedSettings.debugMode 
                                ? 'Debug mode is enabled (not recommended for production)' 
                                : 'Debug mode is disabled'}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-3 text-sm font-medium text-gray-900">
                              {advancedSettings.debugMode ? 'On' : 'Off'}
                            </span>
                            <button 
                              className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none ${
                                advancedSettings.debugMode ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                              onClick={() => setAdvancedSettings({ 
                                ...advancedSettings, 
                                debugMode: !advancedSettings.debugMode 
                              })}
                            >
                              <span 
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  advancedSettings.debugMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              ></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-end">
                    <Button
                      icon={Save}
                      onClick={handleSaveSettings}
                      loading={isSaving}
                    >
                      Save Settings
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing Plus component
const Plus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default AdminSettings;