import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Calendar, 
  Users, 
  Award, 
  Download,
  RefreshCw,
  ChevronDown,
  LogOut,
  AlertCircle,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { db } from '../../lib/supabase';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import LoadingSpinner from '../../components/placeholders/LoadingSpinner';

const AdminAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminAuth = localStorage.getItem('skillvento_admin_auth');
    if (adminAuth !== 'admin123') {
      navigate('/admin11section');
      return;
    }
    
    loadAnalyticsData();
  }, [timeRange, navigate]);
  
  const loadAnalyticsData = async () => {
    setIsLoading(true);
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
      console.error('Error loading analytics data:', error);
      setError(error.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('skillvento_admin_auth');
    navigate('/admin11section');
  };

  // Filter data based on selected time range
  const filterDataByTimeRange = (data: any[]) => {
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeRange) {
      case '7d':
        cutoffDate = subDays(now, 7);
        break;
      case '30d':
        cutoffDate = subDays(now, 30);
        break;
      case '90d':
        cutoffDate = subDays(now, 90);
        break;
      case '1y':
        cutoffDate = subDays(now, 365);
        break;
      default:
        cutoffDate = subDays(now, 30);
    }
    
    return data.filter(item => new Date(item.created_at) >= cutoffDate);
  };

  // Prepare data for charts - memoized to prevent recalculation on every render
  const userGrowthData = useMemo(() => {
    if (users.length === 0) return [];
    
    const filteredUsers = filterDataByTimeRange(users);
    const usersByDate = new Map();
    
    // Sort users by creation date
    const sortedUsers = [...filteredUsers].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Initialize with the earliest date in the filtered range
    let currentDate = timeRange === '7d' ? subDays(new Date(), 7) :
                      timeRange === '30d' ? subDays(new Date(), 30) :
                      timeRange === '90d' ? subDays(new Date(), 90) :
                      subDays(new Date(), 365);
    
    const today = new Date();
    const dataPoints: any[] = [];
    
    // For 7d and 30d, show daily data points
    if (timeRange === '7d' || timeRange === '30d') {
      while (currentDate <= today) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const usersOnDate = sortedUsers.filter(user => 
          format(new Date(user.created_at), 'yyyy-MM-dd') === dateStr
        ).length;
        
        const certsOnDate = certificates.filter(cert => 
          format(new Date(cert.created_at), 'yyyy-MM-dd') === dateStr
        ).length;
        
        dataPoints.push({
          name: format(currentDate, 'MMM dd'),
          users: usersOnDate,
          certificates: certsOnDate
        });
        
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }
    } 
    // For 90d and 1y, show monthly data points
    else {
      // Get the first day of the month for the start date
      currentDate = startOfMonth(currentDate);
      
      while (currentDate <= today) {
        const monthEnd = endOfMonth(currentDate);
        
        const usersInMonth = sortedUsers.filter(user => {
          const userDate = new Date(user.created_at);
          return userDate >= currentDate && userDate <= monthEnd;
        }).length;
        
        const certsInMonth = certificates.filter(cert => {
          const certDate = new Date(cert.created_at);
          return certDate >= currentDate && certDate <= monthEnd;
        }).length;
        
        dataPoints.push({
          name: format(currentDate, 'MMM yyyy'),
          users: usersInMonth,
          certificates: certsInMonth
        });
        
        // Move to next month
        currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      }
    }
    
    return dataPoints;
  }, [users, certificates, timeRange]);

  const userActivityData = useMemo(() => {
    if (certificates.length === 0) return [];
    
    const filteredCertificates = filterDataByTimeRange(certificates);
    
    // For 7d, show daily activity
    if (timeRange === '7d') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const activityByDay = Array(7).fill(0).map(() => ({ active: 0, new: 0 }));
      
      filteredCertificates.forEach(cert => {
        const date = new Date(cert.created_at);
        const dayIndex = date.getDay();
        activityByDay[dayIndex].active++;
      });
      
      filterDataByTimeRange(users).forEach(user => {
        const date = new Date(user.created_at);
        const dayIndex = date.getDay();
        activityByDay[dayIndex].new++;
      });
      
      return days.map((day, index) => ({
        name: day,
        active: activityByDay[index].active,
        new: activityByDay[index].new
      }));
    } 
    // For other time ranges, show weekly or monthly data
    else {
      const dataPoints: any[] = [];
      const interval = timeRange === '30d' ? 7 : // weekly for 30d
                      timeRange === '90d' ? 14 : // bi-weekly for 90d
                      30; // monthly for 1y
      
      let currentDate = new Date();
      const startDate = timeRange === '30d' ? subDays(currentDate, 30) :
                        timeRange === '90d' ? subDays(currentDate, 90) :
                        subDays(currentDate, 365);
      
      while (currentDate >= startDate) {
        const periodEnd = new Date(currentDate);
        const periodStart = subDays(currentDate, interval);
        
        const activeCerts = filteredCertificates.filter(cert => {
          const certDate = new Date(cert.created_at);
          return certDate >= periodStart && certDate <= periodEnd;
        }).length;
        
        const newUsers = filterDataByTimeRange(users).filter(user => {
          const userDate = new Date(user.created_at);
          return userDate >= periodStart && userDate <= periodEnd;
        }).length;
        
        dataPoints.unshift({
          name: format(periodStart, 'MMM dd') + ' - ' + format(periodEnd, 'MMM dd'),
          active: activeCerts,
          new: newUsers
        });
        
        currentDate = subDays(currentDate, interval);
      }
      
      return dataPoints;
    }
  }, [certificates, users, timeRange]);

  const certificateTypesData = useMemo(() => {
    if (certificates.length === 0) return [];
    
    const filteredCertificates = filterDataByTimeRange(certificates);
    const domainCounts: Record<string, number> = {};
    
    filteredCertificates.forEach(cert => {
      domainCounts[cert.domain] = (domainCounts[cert.domain] || 0) + 1;
    });
    
    return Object.entries(domainCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [certificates, timeRange]);

  const subscriptionData = useMemo(() => {
    if (users.length === 0) return [];
    
    const dataPoints: any[] = [];
    const now = new Date();
    
    if (timeRange === '7d' || timeRange === '30d') {
      // Daily data for 7d and 30d
      const days = timeRange === '7d' ? 7 : 30;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(now, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const usersOnDate = users.filter(user => {
          const createdDate = format(new Date(user.created_at), 'yyyy-MM-dd');
          return createdDate <= dateStr;
        });
        
        const freeUsers = usersOnDate.filter(user => user.subscription_tier === 'free').length;
        const proUsers = usersOnDate.filter(user => user.subscription_tier === 'pro').length;
        
        dataPoints.push({
          name: format(date, 'MMM dd'),
          free: freeUsers,
          pro: proUsers
        });
      }
    } else {
      // Monthly data for 90d and 1y
      const months = timeRange === '90d' ? 3 : 12;
      
      for (let i = months - 1; i >= 0; i--) {
        const date = subMonths(now, i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        
        const usersBeforeMonth = users.filter(user => 
          new Date(user.created_at) <= monthEnd
        );
        
        const freeUsers = usersBeforeMonth.filter(user => user.subscription_tier === 'free').length;
        const proUsers = usersBeforeMonth.filter(user => user.subscription_tier === 'pro').length;
        
        dataPoints.push({
          name: format(date, 'MMM yyyy'),
          free: freeUsers,
          pro: proUsers
        });
      }
    }
    
    return dataPoints;
  }, [users, timeRange]);

  const referralData = useMemo(() => {
    // In a real app, this would use actual referral data
    // For now, we'll generate some sample data based on the time range
    const dataPoints: any[] = [];
    const now = new Date();
    
    if (timeRange === '7d') {
      // Daily data for 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        dataPoints.push({
          name: format(date, 'EEE'),
          referrals: Math.floor(Math.random() * 10) + 1 // Random number between 1-10
        });
      }
    } else if (timeRange === '30d') {
      // Weekly data for 30 days
      for (let i = 0; i < 4; i++) {
        const weekStart = subDays(now, i * 7 + 6);
        const weekEnd = subDays(now, i * 7);
        dataPoints.push({
          name: `Week ${4-i}`,
          referrals: Math.floor(Math.random() * 20) + 5 // Random number between 5-25
        });
      }
    } else {
      // Monthly data for 90d or 1y
      const months = timeRange === '90d' ? 3 : 12;
      for (let i = months - 1; i >= 0; i--) {
        const date = subMonths(now, i);
        dataPoints.push({
          name: format(date, 'MMM'),
          referrals: Math.floor(Math.random() * 30) + 10 // Random number between 10-40
        });
      }
    }
    
    return dataPoints;
  }, [timeRange]);

  // Calculate stats based on real data
  const stats = useMemo(() => {
    const filteredUsers = filterDataByTimeRange(users);
    const filteredCertificates = filterDataByTimeRange(certificates);
    const filteredSubscriptions = filterDataByTimeRange(subscriptions);
    
    // Total users in the selected time range
    const totalUsers = filteredUsers.length;
    
    // Total certificates in the selected time range
    const totalCertificates = filteredCertificates.length;
    
    // Conversion rate (percentage of pro users)
    const proUsers = filteredUsers.filter(user => user.subscription_tier === 'pro').length;
    const conversionRate = totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0;
    
    // Total revenue in the selected time range
    const totalRevenue = filteredSubscriptions.reduce((sum, sub) => sum + (sub.price_paid || 0), 0);
    
    return {
      totalUsers,
      totalCertificates,
      conversionRate: conversionRate.toFixed(1),
      totalRevenue
    };
  }, [users, certificates, subscriptions, timeRange]);

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];
  
  if (isLoading) {
    return <LoadingSpinner message="Loading analytics data..." />;
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
                <p className="text-gray-600 text-sm">Platform Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/admin11section/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                Dashboard
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
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
            <p className="text-gray-600">Comprehensive insights into platform performance and user behavior</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setShowTimeRangeDropdown(!showTimeRangeDropdown)}
              >
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>
                  {timeRange === '7d' && 'Last 7 Days'}
                  {timeRange === '30d' && 'Last 30 Days'}
                  {timeRange === '90d' && 'Last 90 Days'}
                  {timeRange === '1y' && 'Last Year'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {showTimeRangeDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowTimeRangeDropdown(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => {
                        setTimeRange('7d');
                        setShowTimeRangeDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Last 7 Days
                    </button>
                    <button
                      onClick={() => {
                        setTimeRange('30d');
                        setShowTimeRangeDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Last 30 Days
                    </button>
                    <button
                      onClick={() => {
                        setTimeRange('90d');
                        setShowTimeRangeDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Last 90 Days
                    </button>
                    <button
                      onClick={() => {
                        setTimeRange('1y');
                        setShowTimeRangeDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Last Year
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              icon={Download}
            >
              Export Report
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={loadAnalyticsData}
              loading={isLoading}
            >
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-600 mt-1">In selected time period</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</p>
                <p className="text-xs text-gray-600 mt-1">In selected time period</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                <p className="text-xs text-gray-600 mt-1">Free to Pro conversion</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">In selected time period</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                User & Certificate Growth
              </h3>
            </div>
            {userGrowthData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.2}
                      name="New Users"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="certificates" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.2}
                      name="New Certificates"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No data available for the selected time period
              </div>
            )}
          </div>

          {/* User Activity Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                User Activity
              </h3>
            </div>
            {userActivityData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="active" name="Certificate Uploads" fill="#10B981" />
                    <Bar dataKey="new" name="New Users" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No activity data available for the selected time period
              </div>
            )}
          </div>
        </div>
        
        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Certificate Types Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />
                Certificate Domains
              </h3>
            </div>
            {certificateTypesData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={certificateTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {certificateTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No certificate data available for the selected time period
              </div>
            )}
          </div>

          {/* Subscription Growth Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
                Subscription Growth
              </h3>
            </div>
            {subscriptionData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={subscriptionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="free" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      name="Free Users"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pro" 
                      stackId="1"
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      name="Pro Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No subscription data available for the selected time period
              </div>
            )}
          </div>
        </div>
        
        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Referral Performance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Referral Performance
              </h3>
            </div>
            {referralData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={referralData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="referrals" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      name="Referrals"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No referral data available for the selected time period
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Key Performance Metrics
              </h3>
            </div>
            
            <div className="space-y-6">
              {/* Conversion Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-gray-700">Free to Pro Conversion</div>
                  <div className="text-sm font-medium text-gray-900">{stats.conversionRate}%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min(parseFloat(stats.conversionRate), 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <div>Target: 10%</div>
                  <div className={parseFloat(stats.conversionRate) >= 10 ? "text-green-600" : "text-red-600"}>
                    {parseFloat(stats.conversionRate) >= 10 ? "+" : ""}{(parseFloat(stats.conversionRate) - 10).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              {/* User Retention - Calculate based on real data */}
              {(() => {
                // Calculate 30-day retention rate
                const thirtyDaysAgo = subDays(new Date(), 30);
                const sixtyDaysAgo = subDays(new Date(), 60);
                
                // Users who signed up 30-60 days ago
                const cohortUsers = users.filter(user => {
                  const createdAt = new Date(user.created_at);
                  return createdAt >= sixtyDaysAgo && createdAt <= thirtyDaysAgo;
                });
                
                // Users from that cohort who have certificates in the last 30 days
                const activeUsers = cohortUsers.filter(user => {
                  return certificates.some(cert => {
                    return cert.user_id === user.id && new Date(cert.created_at) >= thirtyDaysAgo;
                  });
                });
                
                const retentionRate = cohortUsers.length > 0 
                  ? (activeUsers.length / cohortUsers.length) * 100 
                  : 0;
                
                return (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-700">30-Day Retention</div>
                      <div className="text-sm font-medium text-gray-900">{retentionRate.toFixed(1)}%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(retentionRate, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <div>Target: 70%</div>
                      <div className={retentionRate >= 70 ? "text-green-600" : "text-red-600"}>
                        {retentionRate >= 70 ? "+" : ""}{(retentionRate - 70).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {/* Average Certificates per User */}
              {(() => {
                const avgCerts = users.length > 0 
                  ? certificates.length / users.length 
                  : 0;
                
                return (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-700">Avg. Certificates per User</div>
                      <div className="text-sm font-medium text-gray-900">{avgCerts.toFixed(1)}</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${Math.min((avgCerts / 5) * 100, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <div>Target: 5</div>
                      <div className={avgCerts >= 5 ? "text-green-600" : "text-red-600"}>
                        {avgCerts >= 5 ? "+" : ""}{(avgCerts - 5).toFixed(1)}
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              {/* Referral Rate - Calculate based on referred_by field */}
              {(() => {
                const usersWithReferrals = users.filter(user => user.referred_by).length;
                const referralRate = users.length > 0 
                  ? (usersWithReferrals / users.length) * 100 
                  : 0;
                
                return (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-700">Referral Rate</div>
                      <div className="text-sm font-medium text-gray-900">{referralRate.toFixed(1)}%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-orange-600 h-2.5 rounded-full" style={{ width: `${Math.min(referralRate, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <div>Target: 10%</div>
                      <div className={referralRate >= 10 ? "text-green-600" : "text-red-600"}>
                        {referralRate >= 10 ? "+" : ""}{(referralRate - 10).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                {/* Generate activity items based on real data */}
                {[...certificates, ...users, ...subscriptions]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 5)
                  .map((item, index) => {
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
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{action}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{details}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {timeAgo}
                        </td>
                      </tr>
                    );
                  })}
                  
                {[...certificates, ...users, ...subscriptions].length === 0 && (
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
      </div>
    </div>
  );
};

export default AdminAnalytics;