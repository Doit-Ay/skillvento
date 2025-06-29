import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Crown, 
  BarChart3, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Ban, 
  Edit, 
  Trash2, 
  LogOut, 
  Settings, 
  PieChart, 
  Mail,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Calendar,
  Download,
  FileText,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/supabase';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/placeholders/LoadingSpinner';

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const itemsPerPage = 10;
  
  useEffect(() => {
    // Check if admin is logged in
    const adminAuth = localStorage.getItem('skillvento_admin_auth');
    if (adminAuth !== 'admin123') {
      navigate('/admin11section');
      return;
    }
    
    loadDashboardData();
  }, [navigate]);
  
  const loadDashboardData = async () => {
    setIsLoading(true);
    setRefreshing(true);
    setError('');
    
    try {
      // Fetch users
      const { data: userData, error: userError } = await db.getAllUsers();
      if (userError) throw userError;
      
      // Fetch certificates
      const { data: certData, error: certError } = await db.getAllCertificates();
      if (certError) throw certError;
      
      // Fetch subscriptions
      const { data: subData, error: subError } = await db.getAllSubscriptions();
      if (subError) throw subError;
      
      // Set state with fetched data
      setUsers(userData || []);
      setCertificates(certData || []);
      setSubscriptions(subData || []);
      
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('skillvento_admin_auth');
    navigate('/admin11section');
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handleFilterChange = (filter: string) => {
    setUserFilter(filter);
    setCurrentPage(1);
    setShowFilterDropdown(false);
  };
  
  const handleSendLoginLink = (email: string) => {
    setEmailRecipient(email);
    setShowEmailModal(true);
  };
  
  const sendLoginLink = async () => {
    setEmailSending(true);
    setError('');
    
    try {
      // Send magic link via Supabase
      const { error: magicLinkError } = await auth.sendMagicLink(emailRecipient);
      
      if (magicLinkError) {
        throw new Error(magicLinkError.message);
      }
      
      setEmailSent(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSent(false);
        setEmailSending(false);
        setEmailRecipient('');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error sending magic link:', error);
      setError(error.message || 'Failed to send login link');
      setEmailSending(false);
    }
  };
  
  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Apply search filter
      const matchesSearch = 
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      // Apply user type filter
      if (userFilter === 'all') return matchesSearch;
      if (userFilter === 'pro') return matchesSearch && user.subscription_tier === 'pro';
      if (userFilter === 'free') return matchesSearch && user.subscription_tier === 'free';
      if (userFilter === 'recent') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return matchesSearch && new Date(user.created_at) >= thirtyDaysAgo;
      }
      
      return matchesSearch;
    });
  }, [users, searchTerm, userFilter]);
  
  // Sort users
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (sortField === 'created_at') {
        return sortDirection === 'asc' 
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      
      if (sortField === 'full_name') {
        const nameA = a.full_name || '';
        const nameB = b.full_name || '';
        return sortDirection === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      
      if (sortField === 'email') {
        return sortDirection === 'asc' 
          ? (a.email || '').localeCompare(b.email || '')
          : (b.email || '').localeCompare(a.email || '');
      }
      
      if (sortField === 'certificates') {
        const countA = certificates.filter(cert => cert.user_id === a.id).length;
        const countB = certificates.filter(cert => cert.user_id === b.id).length;
        return sortDirection === 'asc' ? countA - countB : countB - countA;
      }
      
      return 0;
    });
  }, [filteredUsers, sortField, sortDirection, certificates]);
  
  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    return sortedUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedUsers, currentPage, itemsPerPage]);
  
  // Calculate stats
  const totalUsers = users.length;
  const totalCertificates = certificates.length;
  const proUsers = users.filter(user => user.subscription_tier === 'pro').length;
  const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.price_paid || 0), 0);
  
  // Calculate certificate stats
  const certificatesByDomain = useMemo(() => {
    return certificates.reduce((acc, cert) => {
      acc[cert.domain] = (acc[cert.domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [certificates]);
  
  const topDomains = useMemo(() => {
    return Object.entries(certificatesByDomain)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }));
  }, [certificatesByDomain]);
  
  // Calculate recent user signups (last 7 days)
  const sevenDaysAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  }, []);
  
  const recentUsers = useMemo(() => {
    return users.filter(user => new Date(user.created_at) >= sevenDaysAgo).length;
  }, [users, sevenDaysAgo]);
  
  // Calculate recent certificate uploads (last 7 days)
  const recentCertificates = useMemo(() => {
    return certificates.filter(cert => new Date(cert.created_at) >= sevenDaysAgo).length;
  }, [certificates, sevenDaysAgo]);
  
  // Calculate user activity by day of week
  const userActivityByDay = useMemo(() => {
    const activity = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    
    certificates.forEach(cert => {
      const date = new Date(cert.created_at);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      activity[dayOfWeek]++;
    });
    
    return activity;
  }, [certificates]);
  
  // Calculate most active users
  const userCertificateCounts = useMemo(() => {
    return users.map(user => {
      const certCount = certificates.filter(cert => cert.user_id === user.id).length;
      return {
        id: user.id,
        name: user.full_name || user.username || user.email?.split('@')[0] || 'Unknown',
        email: user.email,
        certificateCount: certCount
      };
    }).sort((a, b) => b.certificateCount - a.certificateCount).slice(0, 5);
  }, [users, certificates]);
  
  // Recent activity items
  const recentActivityItems = useMemo(() => {
    return [...certificates, ...users, ...subscriptions]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(item => {
        // Determine item type and create activity entry
        let type = 'certificate';
        let action = 'uploaded a new certificate';
        let user = 'unknown user';
        let details = '';
        
        if ('title' in item) {
          // It's a certificate
          type = 'certificate';
          action = 'uploaded a new certificate';
          const userObj = users.find(u => u.id === item.user_id);
          user = userObj?.email || 'unknown user';
          details = `"${item.title}" from ${item.organization}`;
        } else if ('subscription_tier' in item) {
          // It's a user
          type = 'user';
          action = 'created an account';
          user = item.email || 'unknown user';
          details = `${item.full_name ? `as ${item.full_name}` : ''}`;
        } else if ('plan_name' in item) {
          // It's a subscription
          type = 'subscription';
          action = `upgraded to ${item.plan_name} plan`;
          const userObj = users.find(u => u.id === item.user_id);
          user = userObj?.email || 'unknown user';
          details = `₹${item.price_paid} paid`;
        }
        
        // Calculate time ago
        const itemDate = new Date(item.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - itemDate.getTime());
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let timeAgo = '';
        if (diffMinutes < 60) {
          timeAgo = `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
          timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else {
          timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        }
        
        return {
          type,
          action,
          user,
          details,
          timeAgo,
          date: itemDate
        };
      });
  }, [certificates, users, subscriptions]);
  
  if (isLoading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Skillvento Admin</h1>
                <p className="text-gray-600 text-sm">Dashboard Overview</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/admin11section/analytics" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                Analytics
              </Link>
              <Link to="/admin11section/settings" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                Settings
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
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
            <button 
              onClick={() => setError('')} 
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">+{recentUsers} in last 7 days</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{totalCertificates}</p>
                <p className="text-xs text-green-600 mt-1">+{recentCertificates} in last 7 days</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pro Users</p>
                <p className="text-2xl font-bold text-gray-900">{proUsers}</p>
                <p className="text-xs text-green-600 mt-1">{totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : 0}% conversion rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">₹{totalUsers > 0 ? (totalRevenue / totalUsers).toFixed(0) : 0} per user</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* User Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                <p className="text-gray-600">Manage and monitor user accounts ({totalUsers} total users)</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearch}
                    icon={Search}
                  />
                </div>
                
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span>
                      {userFilter === 'all' && 'All Users'}
                      {userFilter === 'pro' && 'Pro Users'}
                      {userFilter === 'free' && 'Free Users'}
                      {userFilter === 'recent' && 'Recent Users'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  {showFilterDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowFilterDropdown(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <button
                          onClick={() => handleFilterChange('all')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          All Users
                        </button>
                        <button
                          onClick={() => handleFilterChange('pro')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Pro Users
                        </button>
                        <button
                          onClick={() => handleFilterChange('free')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Free Users
                        </button>
                        <button
                          onClick={() => handleFilterChange('recent')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Recent Users (30 days)
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  onClick={loadDashboardData}
                  loading={refreshing}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('full_name')}
                  >
                    <div className="flex items-center">
                      <span>User</span>
                      {sortField === 'full_name' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="h-4 w-4 ml-1" /> : 
                          <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      <span>Email</span>
                      {sortField === 'email' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="h-4 w-4 ml-1" /> : 
                          <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('certificates')}
                  >
                    <div className="flex items-center">
                      <span>Certificates</span>
                      {sortField === 'certificates' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="h-4 w-4 ml-1" /> : 
                          <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      <span>Joined</span>
                      {sortField === 'created_at' && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="h-4 w-4 ml-1" /> : 
                          <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => {
                    const userCertificates = certificates.filter(cert => cert.user_id === user.id);
                    const joinDate = new Date(user.created_at);
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              {(user.full_name || user.email || 'U')[0].toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name || 'Unnamed User'}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{user.username || 'no-username'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.subscription_tier === 'pro' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userCertificates.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {joinDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleSendLoginLink(user.email)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Send login link"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="View user"
                              onClick={() => window.open(`/u/${user.username}`, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Suspend user"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        {searchTerm ? 'No users match your search criteria' : 'No users found'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
                </span>{' '}
                of <span className="font-medium">{filteredUsers.length}</span> users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Dashboard Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Certificate Domains */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                Top Certificate Domains
              </h3>
            </div>
            
            <div className="space-y-4">
              {topDomains.length > 0 ? (
                topDomains.map((domain, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{domain.domain}</span>
                      <span className="text-sm text-gray-600">{domain.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-600" 
                        style={{ 
                          width: `${(domain.count / (topDomains[0]?.count || 1)) * 100}%`,
                          backgroundColor: index === 0 ? '#3B82F6' : 
                                          index === 1 ? '#8B5CF6' : 
                                          index === 2 ? '#10B981' : 
                                          index === 3 ? '#F59E0B' : 
                                          '#EF4444'
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No certificate data available
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                fullWidth
              >
                View All Domains
              </Button>
            </div>
          </div>
          
          {/* Recent Signups */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Recent Signups
              </h3>
            </div>
            
            <div className="space-y-4">
              {users.length > 0 ? (
                users
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 5)
                  .map((user, index) => {
                    const joinDate = new Date(user.created_at);
                    const today = new Date();
                    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={index} className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {(user.full_name || user.email || 'U')[0].toUpperCase()}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900">{user.full_name || 'Unnamed User'}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent signups
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                fullWidth
              >
                View All Users
              </Button>
            </div>
          </div>
          
          {/* Most Active Users */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                Most Active Users
              </h3>
            </div>
            
            <div className="space-y-4">
              {userCertificateCounts.length > 0 ? (
                userCertificateCounts.map((user, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-medium" 
                      style={{
                        background: index === 0 ? 'linear-gradient(to right, #3B82F6, #8B5CF6)' :
                                  index === 1 ? 'linear-gradient(to right, #8B5CF6, #D946EF)' :
                                  index === 2 ? 'linear-gradient(to right, #10B981, #3B82F6)' :
                                  index === 3 ? 'linear-gradient(to right, #F59E0B, #EF4444)' :
                                  'linear-gradient(to right, #6B7280, #9CA3AF)',
                        color: 'white'
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {user.certificateCount} certs
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No active users data
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                fullWidth
              >
                View User Activity
              </Button>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h3>
            <Button
              variant="outline"
              size="sm"
            >
              View All Activity
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivityItems.length > 0 ? (
                  recentActivityItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                            item.type === 'certificate' ? 'bg-green-100 text-green-600' :
                            item.type === 'subscription' ? 'bg-purple-100 text-purple-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {item.type === 'certificate' && <Award className="h-4 w-4" />}
                            {item.type === 'subscription' && <Crown className="h-4 w-4" />}
                            {item.type === 'user' && <Users className="h-4 w-4" />}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{item.action}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.user}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.details}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.timeAgo}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No recent activity
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              icon={Download}
              fullWidth
            >
              Export User Data
            </Button>
            
            <Button
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
              icon={Mail}
              fullWidth
            >
              Send Newsletter
            </Button>
            
            <Button
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
              icon={Settings}
              fullWidth
            >
              Platform Settings
            </Button>
            
            <Button
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
              icon={FileText}
              fullWidth
            >
              View Reports
            </Button>
          </div>
        </div>
      </div>
      
      {/* Email Magic Link Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send Login Link</h3>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailSent(false);
                  setEmailSending(false);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {emailSent ? (
              <div className="text-center py-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Login Link Sent!</h3>
                <p className="text-gray-600">
                  A secure login link has been sent to {emailRecipient}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Send a secure login link to this user's email address. The link will expire after 10 minutes.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                    <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-700">
                        This will send a login link to: <span className="font-semibold">{emailRecipient}</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailModal(false)}
                    disabled={emailSending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={sendLoginLink}
                    loading={emailSending}
                    icon={Mail}
                  >
                    Send Login Link
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;