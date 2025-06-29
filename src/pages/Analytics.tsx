import React, { useState, useEffect } from 'react';
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
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  Calendar, 
  Target, 
  Users, 
  BookOpen,
  Trophy,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { auth, db } from '../lib/supabase';
import { Certificate } from '../types';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const Analytics: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'6m' | '1y' | 'all'>('1y');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const user = await auth.getCurrentUser();
      if (user) {
        const { data: certs } = await db.getUserCertificates(user.id);
        setCertificates(certs || []);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Analytics calculations
  const getDomainDistribution = () => {
    const domainCounts = certificates.reduce((acc, cert) => {
      acc[cert.domain] = (acc[cert.domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(domainCounts).map(([domain, count]) => ({
      name: domain,
      value: count,
      percentage: Math.round((count / certificates.length) * 100)
    }));
  };

  const getMonthlyProgress = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const certsInMonth = certificates.filter(cert => {
        const certDate = new Date(cert.issued_on);
        return certDate >= monthStart && certDate <= monthEnd;
      });

      months.push({
        month: format(date, 'MMM yyyy'),
        certificates: certsInMonth.length,
        cumulative: certificates.filter(cert => new Date(cert.issued_on) <= monthEnd).length
      });
    }
    
    return months;
  };

  const getSkillTrends = () => {
    const skillCounts = certificates.reduce((acc, cert) => {
      cert.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({
        skill,
        count,
        level: count >= 5 ? 'Expert' : count >= 3 ? 'Intermediate' : 'Beginner'
      }));
  };

  const getStats = () => {
    const totalCerts = certificates.length;
    const thisYear = new Date().getFullYear();
    const thisYearCerts = certificates.filter(cert => 
      new Date(cert.issued_on).getFullYear() === thisYear
    ).length;
    
    const uniqueDomains = new Set(certificates.map(cert => cert.domain)).size;
    const uniqueOrgs = new Set(certificates.map(cert => cert.organization)).size;
    const verifiedCerts = certificates.filter(cert => cert.is_verified).length;
    
    return {
      totalCerts,
      thisYearCerts,
      uniqueDomains,
      uniqueOrgs,
      verifiedCerts,
      verificationRate: totalCerts > 0 ? Math.round((verifiedCerts / totalCerts) * 100) : 0
    };
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

  const stats = getStats();
  const domainData = getDomainDistribution();
  const monthlyData = getMonthlyProgress();
  const skillData = getSkillTrends();

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Track your learning progress and skill development over time
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Year</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisYearCerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Skill Domains</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueDomains}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Trophy className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verificationRate}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Progress Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Monthly Progress
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="certificates" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.1}
                  name="New Certificates"
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Total Certificates"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Domain Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />
                Skill Domains
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={domainData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {domainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Skills */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                Top Skills
              </h3>
            </div>
            <div className="space-y-4">
              {skillData.map((skill, index) => (
                <div key={skill.skill} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{skill.skill}</p>
                      <p className="text-sm text-gray-500">{skill.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((skill.count / Math.max(...skillData.map(s => s.count))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{skill.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Insights */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Learning Insights
              </h3>
            </div>
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Most Active Domain</h4>
                <p className="text-blue-700">
                  {domainData.length > 0 ? domainData[0].name : 'No data'} 
                  {domainData.length > 0 && ` (${domainData[0].value} certificates)`}
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Learning Velocity</h4>
                <p className="text-green-700">
                  {stats.thisYearCerts > 0 
                    ? `${Math.round(stats.thisYearCerts / 12)} certificates per month this year`
                    : 'No certificates this year'
                  }
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Skill Diversity</h4>
                <p className="text-purple-700">
                  {stats.uniqueDomains} different skill domains covered
                </p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-2">Organizations</h4>
                <p className="text-orange-700">
                  Certificates from {stats.uniqueOrgs} different organizations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-gray-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Keep Growing Your Skills! 🚀
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              You're making great progress! Consider setting learning goals to accelerate your professional development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                Set Learning Goals
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-white transition-all duration-200">
                Explore Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;