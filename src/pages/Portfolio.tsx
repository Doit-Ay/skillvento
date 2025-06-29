import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Award, 
  Calendar, 
  Building, 
  Tag, 
  ExternalLink, 
  Share2, 
  Download,
  Linkedin,
  Github,
  Globe,
  QrCode,
  Eye,
  X,
  Filter,
  Grid,
  List,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  Menu
} from 'lucide-react';
import { db, storage } from '../lib/supabase';
import type { User, Certificate } from '../types';
import { format } from 'date-fns';
import Button from '../components/common/Button';

const Portfolio: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDownloadOptions, setShowDownloadOptions] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (username) {
      loadPortfolioData();
    }
  }, [username]);

  const loadPortfolioData = async () => {
    try {
      const { data: userData, error: userError } = await db.getUserByUsername(username!);
      
      if (userError || !userData) {
        setError('Portfolio not found');
        return;
      }

      setUser(userData);

      const { data: certsData } = await db.getPublicCertificates(userData.id);
      setCertificates(certsData || []);
    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const portfolioUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.full_name || user?.username}'s Portfolio`,
          text: `Check out ${user?.full_name || user?.username}'s professional portfolio on Skillvento`,
          url: portfolioUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(portfolioUrl);
      alert('Portfolio link copied to clipboard!');
    }
  };

  const handleCertificateShare = async (certificate: Certificate) => {
    const certificateUrl = `${window.location.origin}/u/${username}/certificate/${certificate.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: certificate.title,
          text: `Check out my ${certificate.title} certificate from ${certificate.organization}`,
          url: certificateUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(certificateUrl);
      alert('Certificate link copied to clipboard!');
    }
  };

  const handleCertificateDownload = async (certificate: Certificate, format: 'pdf' | 'image') => {
    try {
      let fileUrl: string;
      let fileName: string;
      
      if (format === 'pdf') {
        if (certificate.pdf_url) {
          fileUrl = storage.getPublicUrl(certificate.pdf_url).data.publicUrl;
        } else if (certificate.certificate_type === 'pdf') {
          fileUrl = storage.getPublicUrl(certificate.file_url).data.publicUrl;
        } else {
          alert('PDF version not available for this certificate');
          return;
        }
        fileName = `${certificate.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      } else {
        if (certificate.image_url) {
          fileUrl = storage.getPublicUrl(certificate.image_url).data.publicUrl;
        } else if (certificate.certificate_type === 'image') {
          fileUrl = storage.getPublicUrl(certificate.file_url).data.publicUrl;
        } else {
          alert('Image version not available for this certificate');
          return;
        }
        fileName = `${certificate.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      }

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowDownloadOptions(null);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`;
    return qrUrl;
  };

  const getAvailableDomains = useMemo(() => {
    const domains = [...new Set(certificates.map(cert => cert.domain))];
    return domains.sort();
  }, [certificates]);

  const filteredCertificates = useMemo(() => {
    return selectedDomain 
      ? certificates.filter(cert => cert.domain === selectedDomain)
      : certificates;
  }, [certificates, selectedDomain]);

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

  const handleViewCertificate = (certificate: Certificate) => {
    setViewingCertificate(certificate);
  };

  // Get the appropriate image URL for display (always use image version for thumbnails)
  const getCertificateImageUrl = (certificate: Certificate) => {
    if (certificate.image_url) {
      return storage.getPublicUrl(certificate.image_url).data.publicUrl;
    } else if (certificate.thumbnail_url) {
      return storage.getPublicUrl(certificate.thumbnail_url).data.publicUrl;
    } else if (certificate.certificate_type === 'image') {
      return storage.getPublicUrl(certificate.file_url).data.publicUrl;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex flex-col items-center lg:items-start lg:flex-row lg:space-x-8 mb-6 lg:mb-0 w-full lg:w-auto">
              {/* Avatar */}
              <div className="relative mb-4 lg:mb-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || user.username}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                  <Award className="h-4 w-4 text-white" />
                </div>
              </div>
              
              {/* User Info */}
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {user?.full_name || user?.username}
                </h1>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 text-sm text-blue-100">
                  <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                    <Award className="h-4 w-4 mr-2" />
                    {certificates.length} Certificates
                  </span>
                  <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Since {format(new Date(user?.created_at || ''), 'MMM yyyy')}
                  </span>
                  <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                    <Building className="h-4 w-4 mr-2" />
                    {getAvailableDomains.length} Domains
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
              <Button
                variant="outline"
                size="sm"
                icon={Share2}
                onClick={handleShare}
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={QrCode}
                onClick={() => setShowQR(!showQR)}
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                QR Code
              </Button>
              <Link to={`/u/${username}/resume`}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  Resume
                </Button>
              </Link>
            </div>
          </div>

          {/* Social Links */}
          {user?.social_links && Object.keys(user.social_links).length > 0 && (
            <div className="mt-6 flex items-center justify-center lg:justify-start space-x-4">
              {user.social_links.linkedin && (
                <a
                  href={user.social_links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-white transition-colors duration-200 bg-white/10 p-2 rounded-full hover:bg-white/20"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {user.social_links.github && (
                <a
                  href={user.social_links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-white transition-colors duration-200 bg-white/10 p-2 rounded-full hover:bg-white/20"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {user.social_links.website && (
                <a
                  href={user.social_links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-100 hover:text-white transition-colors duration-200 bg-white/10 p-2 rounded-full hover:bg-white/20"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Portfolio</h3>
            <img
              src={generateQRCode()}
              alt="QR Code"
              className="mx-auto mb-4 rounded-lg"
            />
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code to view the portfolio
            </p>
            <Button
              variant="outline"
              onClick={() => setShowQR(false)}
              fullWidth
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {viewingCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="overflow-hidden">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{viewingCertificate.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base truncate">{viewingCertificate.organization}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={() => setShowDownloadOptions(showDownloadOptions === 'modal' ? null : 'modal')}
                    className="flex items-center px-2 py-1 sm:px-3 sm:py-2 text-green-600 hover:text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors duration-200 text-sm"
                  >
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                  
                  {showDownloadOptions === 'modal' && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCertificateDownload(viewingCertificate, 'pdf');
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                      >
                        <FileText className="h-4 w-4 mr-2 text-red-600" />
                        Download PDF
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCertificateDownload(viewingCertificate, 'image');
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                      >
                        <ImageIcon className="h-4 w-4 mr-2 text-blue-600" />
                        Download Image
                      </button>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  icon={Share2}
                  onClick={() => handleCertificateShare(viewingCertificate)}
                  className="hidden sm:flex"
                >
                  Share
                </Button>
                <button
                  onClick={() => handleCertificateShare(viewingCertificate)}
                  className="sm:hidden flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewingCertificate(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 overflow-auto max-h-[calc(95vh-120px)]">
              {viewingCertificate.certificate_type === 'image' ? (
                <img
                  src={storage.getPublicUrl(viewingCertificate.file_url).data.publicUrl}
                  alt={viewingCertificate.title}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              ) : (
                <iframe
                  src={storage.getPublicUrl(viewingCertificate.file_url).data.publicUrl}
                  className="w-full h-[70vh] rounded-lg shadow-lg"
                  title={viewingCertificate.title}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Certificates & Achievements
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Showcasing professional growth and expertise across multiple domains
              </p>
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center space-x-4">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              >
                <option value="">All Domains</option>
                {getAvailableDomains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
              <div className="flex rounded-xl border border-gray-300 overflow-hidden bg-white/80 backdrop-blur-sm">
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
              <span className="text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl">
                {filteredCertificates.length} certificate{filteredCertificates.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Mobile Filters Button */}
            <div className="flex lg:hidden items-center w-full">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex items-center justify-between w-full px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl"
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-gray-700">Filters</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {/* Mobile Filters Dropdown */}
            {showMobileMenu && (
              <div className="lg:hidden w-full bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Domains</option>
                    {getAvailableDomains.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden">
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
                
                <div className="pt-2 text-center text-sm text-gray-500">
                  {filteredCertificates.length} certificate{filteredCertificates.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Certificates */}
        {filteredCertificates.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 sm:p-12 text-center shadow-lg border border-white/50">
            <Award className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No certificates to display</h3>
            <p className="text-gray-600">
              {selectedDomain 
                ? 'No certificates found for the selected domain'
                : 'This portfolio doesn\'t have any public certificates yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {groupCertificatesByYear.map(({ year, certificates: yearCerts }) => (
              <div key={year} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-8 shadow-lg border border-white/50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-600" />
                  {year}
                  <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-normal text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                    {yearCerts.length} certificate{yearCerts.length !== 1 ? 's' : ''}
                  </span>
                </h3>
                
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {yearCerts.map(certificate => {
                      const imageUrl = getCertificateImageUrl(certificate);
                      
                      return (
                        <div
                          key={certificate.id}
                          className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          {/* Certificate Preview */}
                          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer relative" onClick={() => handleViewCertificate(certificate)}>
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={certificate.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement!;
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 group-hover:from-red-100 group-hover:to-orange-100 transition-colors duration-300">
                                      <div class="text-center">
                                        <div class="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                          <svg class="h-6 w-6 sm:h-8 sm:w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                          </svg>
                                        </div>
                                        <p class="text-sm text-red-600 font-medium">${certificate.certificate_type === 'pdf' ? 'PDF Certificate' : 'Certificate'}</p>
                                      </div>
                                    </div>
                                  `;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 group-hover:from-red-100 group-hover:to-orange-100 transition-colors duration-300">
                                <div className="text-center">
                                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <ExternalLink className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                                  </div>
                                  <p className="text-sm text-red-600 font-medium">
                                    {certificate.certificate_type === 'pdf' ? 'PDF Certificate' : 'Certificate'}
                                  </p>
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="bg-white text-gray-900 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-sm">
                                <Eye className="h-4 w-4 inline mr-2" />
                                View Certificate
                              </div>
                            </div>
                          </div>

                          {/* Certificate Info */}
                          <div className="p-4 sm:p-6">
                            <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 text-base sm:text-lg">
                              {certificate.title}
                            </h4>
                            
                            <div className="space-y-2 sm:space-y-3 mb-4">
                              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                                <span className="font-medium truncate">{certificate.organization}</span>
                              </div>
                              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                                {format(new Date(certificate.issued_on), 'MMM dd, yyyy')}
                              </div>
                              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                                <Tag className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                  {certificate.domain}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                              <div className="relative flex-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDownloadOptions(showDownloadOptions === certificate.id ? null : certificate.id);
                                  }}
                                  className="w-full flex items-center justify-center text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium py-1 sm:py-2 px-2 sm:px-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                                >
                                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                  Download
                                </button>
                                
                                {showDownloadOptions === certificate.id && (
                                  <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCertificateDownload(certificate, 'pdf');
                                      }}
                                      className="w-full flex items-center px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                                    >
                                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-red-600" />
                                      PDF
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCertificateDownload(certificate, 'image');
                                      }}
                                      className="w-full flex items-center px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                                    >
                                      <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600" />
                                      Image
                                    </button>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCertificateShare(certificate);
                                }}
                                className="flex items-center justify-center text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium py-1 sm:py-2 px-2 sm:px-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors duration-200"
                              >
                                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {yearCerts.map(certificate => {
                      const imageUrl = getCertificateImageUrl(certificate);
                      
                      return (
                        <div
                          key={certificate.id}
                          className="bg-white rounded-xl p-3 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                          onClick={() => handleViewCertificate(certificate)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            {/* Certificate Thumbnail */}
                            <div className="w-full sm:w-16 h-32 sm:h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={certificate.title}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement!.innerHTML = `
                                      <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                      </svg>
                                    `;
                                  }}
                                />
                              ) : (
                                <Award className="h-8 w-8 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1 text-base sm:text-lg">{certificate.title}</h4>
                              <p className="text-gray-600 text-sm mb-2">{certificate.organization}</p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span>{format(new Date(certificate.issued_on), 'MMM dd, yyyy')}</span>
                                <span className="bg-gray-100 px-2 py-1 rounded">{certificate.domain}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-end space-x-2 mt-2 sm:mt-0">
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDownloadOptions(showDownloadOptions === certificate.id ? null : certificate.id);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                >
                                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                                
                                {showDownloadOptions === certificate.id && (
                                  <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCertificateDownload(certificate, 'pdf');
                                      }}
                                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                                    >
                                      <FileText className="h-4 w-4 mr-2 text-red-600" />
                                      PDF
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCertificateDownload(certificate, 'image');
                                      }}
                                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                                    >
                                      <ImageIcon className="h-4 w-4 mr-2 text-blue-600" />
                                      Image
                                    </button>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCertificateShare(certificate);
                                }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              >
                                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200/50 py-4 mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <Award className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">
                Powered by <span className="font-semibold text-blue-600">Skillvento</span>
              </span>
            </div>
            <div className="text-xs text-gray-500">
              © 2024 Professional Portfolio
            </div>
          </div>
        </div>
      </footer>

      {/* Click outside to close download options */}
      {showDownloadOptions && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowDownloadOptions(null)}
        />
      )}
    </div>
  );
};

export default Portfolio;