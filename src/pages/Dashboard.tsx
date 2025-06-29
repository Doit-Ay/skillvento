import React, { useState, useEffect, useMemo } from 'react';
import { 
  Upload, 
  Grid, 
  List, 
  Search, 
  Filter, 
  Plus, 
  Award, 
  Calendar,
  Tag,
  Building,
  Eye,
  Edit,
  Trash2,
  Share2,
  Users,
  FileText,
  TrendingUp,
  User,
  ExternalLink,
  X,
  Download,
  Chrome,
  Puzzle,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth, db, storage } from '../lib/supabase';
import type { User as UserType, Certificate } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import CertificateUpload from '../components/dashboard/CertificateUpload';
import CertificateCard from '../components/dashboard/CertificateCard';
import CertificateList from '../components/dashboard/CertificateList';
import UploadLimitCard from '../components/dashboard/UploadLimitCard';
import ReferralCard from '../components/dashboard/ReferralCard';
import LoadingSpinner from '../components/placeholders/LoadingSpinner';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [uploadCount, setUploadCount] = useState(0);
  const [referralStats, setReferralStats] = useState({ count: 0, bonusUploads: 0 });
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showExtensionPromo, setShowExtensionPromo] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Updated domains list with custom domains from database
  const [domains, setDomains] = useState([
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'UI/UX Design',
    'Cloud Computing',
    'Cybersecurity',
    'DevOps',
    'Blockchain',
    'Digital Marketing',
    'Project Management',
    'Software Engineering',
    'Database Management',
    'Network Administration'
  ]);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchTerm, selectedDomain, selectedYear]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await auth.getCurrentUser();
      if (currentUser) {
        // Get user profile
        const { data: profile, error: profileError } = await db.getUserProfile(currentUser.id);
        
        if (profileError) {
          throw profileError;
        }
        
        setUser(profile);

        // Check if profile setup is needed
        if (!profile?.username || !profile?.full_name) {
          setShowProfileSetup(true);
        }

        // Get certificates
        const { data: certs, error: certsError } = await db.getUserCertificates(currentUser.id);
        
        if (certsError) {
          throw certsError;
        }
        
        setCertificates(certs || []);

        // Extract custom domains from certificates and add to domains list
        if (certs && certs.length > 0) {
          const customDomains = [...new Set(certs.map(cert => cert.domain))];
          const allDomains = [...new Set([...domains, ...customDomains])];
          setDomains(allDomains.sort());
        }

        // Get upload count
        const count = await db.getCertificateCount(currentUser.id);
        setUploadCount(count);

        // Get referral stats
        const stats = await db.getReferralStats(currentUser.id);
        setReferralStats(stats);
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
      setError(error.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const filterCertificates = () => {
    let filtered = certificates;

    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedDomain) {
      filtered = filtered.filter(cert => cert.domain === selectedDomain);
    }

    if (selectedYear) {
      filtered = filtered.filter(cert => 
        new Date(cert.issued_on).getFullYear().toString() === selectedYear
      );
    }

    setFilteredCertificates(filtered);
  };

  const handleCertificateUploaded = () => {
    loadUserData();
    setShowUploadModal(false);
    setEditingCertificate(null);
  };

  const handleEditCertificate = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setShowUploadModal(true);
  };

  const handleDeleteCertificate = async (certificateId: string) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await db.deleteCertificate(certificateId);
        loadUserData();
      } catch (error) {
        console.error('Error deleting certificate:', error);
      }
    }
  };

  const getUploadLimit = () => {
    const baseLimit = user?.upload_limit || 25;
    return baseLimit + referralStats.bonusUploads;
  };

  const getAvailableYears = useMemo(() => {
    const years = certificates.map(cert => new Date(cert.issued_on).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }, [certificates]);

  const groupCertificatesByYear = useMemo(() => {
    const grouped = filteredCertificates.reduce((acc, cert) => {
      const year = new Date(cert.issued_on).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(cert);
      return acc;
    }, {} as Record<number, Certificate[]>);

    return Object.entries(grouped)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([year, certs]) => ({
        year: parseInt(year),
        certificates: certs.sort((a, b) => new Date(b.issued_on).getTime() - new Date(a.issued_on).getTime())
      }));
  }, [filteredCertificates]);

  const handleInstallExtension = () => {
    // Show coming soon message for now
    alert('🚀 Browser Extension Coming Soon!\n\nOur Chrome extension is currently in development and will be available soon. This will allow you to automatically capture certificates from any webpage!\n\nStay tuned for updates!');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => loadUserData()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Profile Setup Banner */}
        {showProfileSetup && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex items-center mb-3 sm:mb-0">
                <User className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Complete your profile</h3>
                  <p className="text-sm text-blue-700">Add your name and username to get started</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link to="/profile/setup">
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    Complete Profile
                  </Button>
                </Link>
                <button
                  onClick={() => setShowProfileSetup(false)}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Extension Promo Banner */}
        {showExtensionPromo && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex items-start sm:items-center mb-4 sm:mb-0">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-xl mr-4 flex-shrink-0">
                  <Puzzle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                    🚀 New: Browser Extension Coming Soon!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Automatically capture certificates from any webpage.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="flex items-center text-xs text-green-600">
                      <Chrome className="h-3 w-3 mr-1" />
                      Chrome Extension
                    </div>
                    <div className="flex items-center text-xs text-blue-600">
                      <Eye className="h-3 w-3 mr-1" />
                      Auto-detect certificates
                    </div>
                    <div className="flex items-center text-xs text-purple-600">
                      <Upload className="h-3 w-3 mr-1" />
                      One-click upload
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleInstallExtension}
                  size="sm"
                  icon={Download}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Coming Soon
                </Button>
                <button
                  onClick={() => setShowExtensionPromo(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.full_name || user?.username || 'User'}!
              </h1>
              <p className="text-gray-600">
                Manage your certificates and build your professional portfolio
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {user?.username && (
                <Link to={`/u/${user.username}`}>
                  <Button variant="outline" icon={ExternalLink} className="text-sm">
                    <span className="hidden sm:inline">View Portfolio</span>
                    <span className="sm:hidden">Portfolio</span>
                  </Button>
                </Link>
              )}
              <Link to="/resume">
                <Button variant="outline" icon={FileText} className="text-sm">
                  <span className="hidden sm:inline">Build Resume</span>
                  <span className="sm:hidden">Resume</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards - Mobile Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <Award className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Certificates</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{certificates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">This Month</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {certificates.filter(cert => {
                    const certDate = new Date(cert.issued_on);
                    const now = new Date();
                    return certDate.getMonth() === now.getMonth() && 
                           certDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Referrals</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{referralStats.count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 sm:p-3 rounded-lg">
                <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Public Certs</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {certificates.filter(cert => cert.is_public).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            {/* Controls */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center justify-between w-full sm:w-auto">
                  <h2 className="text-xl font-semibold text-gray-900">Certificate Vault</h2>
                  {/* Mobile upload button - only visible on small screens */}
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    icon={Plus}
                    disabled={uploadCount >= getUploadLimit()}
                    className="sm:hidden"
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                
                {/* Desktop upload button - only visible on larger screens */}
                <div className="hidden sm:block">
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    icon={Plus}
                    disabled={uploadCount >= getUploadLimit()}
                  >
                    Upload Certificate
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search certificates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      icon={Search}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleFilters}
                      className="sm:hidden flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Filters</span>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div className="hidden sm:flex rounded-lg border border-gray-300 overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <Grid className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <List className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Filters - Collapsible */}
                <div className={`sm:flex gap-3 ${showFilters ? 'flex flex-col' : 'hidden'}`}>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                  >
                    <option value="">All Domains</option>
                    {domains.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                  >
                    <option value="">All Years</option>
                    {getAvailableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <div className="flex sm:hidden rounded-lg border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Grid className="h-5 w-5 mx-auto" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <List className="h-5 w-5 mx-auto" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              {filteredCertificates.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Award className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {certificates.length === 0 ? 'No certificates yet' : 'No certificates match your search'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {certificates.length === 0 
                      ? 'Upload your first certificate to get started building your portfolio'
                      : 'Try adjusting your search or filter criteria'
                    }
                  </p>
                  {certificates.length === 0 && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => setShowUploadModal(true)}
                        icon={Plus}
                        disabled={uploadCount >= getUploadLimit()}
                      >
                        Upload Your First Certificate
                      </Button>
                      <Button
                        variant="outline"
                        icon={Puzzle}
                        onClick={handleInstallExtension}
                      >
                        Get Browser Extension
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    <div className="space-y-8">
                      {groupCertificatesByYear.map(({ year, certificates: yearCerts }) => (
                        <div key={year}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                            {year}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              ({yearCerts.length} certificate{yearCerts.length !== 1 ? 's' : ''})
                            </span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                            {yearCerts.map(certificate => (
                              <CertificateCard
                                key={certificate.id}
                                certificate={certificate}
                                onDelete={handleDeleteCertificate}
                                onEdit={handleEditCertificate}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <div className="inline-block min-w-full align-middle">
                        <CertificateList
                          certificates={filteredCertificates}
                          onDelete={handleDeleteCertificate}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 order-1 lg:order-2">
            <UploadLimitCard
              current={uploadCount}
              limit={getUploadLimit()}
              bonusUploads={referralStats.bonusUploads}
            />
            <ReferralCard
              referralCode={user?.referral_code || ''}
              referralCount={referralStats.count}
              bonusUploads={referralStats.bonusUploads}
              username={user?.username}
            />
          </div>
        </div>
      </div>

      {/* Upload/Edit Modal */}
      {showUploadModal && (
        <CertificateUpload
          onClose={() => {
            setShowUploadModal(false);
            setEditingCertificate(null);
          }}
          onSuccess={handleCertificateUploaded}
          domains={domains}
          editingCertificate={editingCertificate}
        />
      )}
    </div>
  );
};

export default Dashboard;