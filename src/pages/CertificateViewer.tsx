import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Award, 
  Calendar, 
  Building, 
  Tag, 
  ExternalLink, 
  Share2, 
  Download,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Shield,
  X
} from 'lucide-react';
import { db, storage } from '../lib/supabase';
import type { User, Certificate } from '../types';
import { format } from 'date-fns';
import Button from '../components/common/Button';
import VerificationBadge from '../components/verification/VerificationBadge';
import VerificationQRCode from '../components/verification/VerificationQRCode';

const CertificateViewer: React.FC = () => {
  const { username, certificateId } = useParams<{ username: string; certificateId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);

  useEffect(() => {
    if (certificateId) {
      loadCertificateData();
    }
  }, [certificateId, username]);

  const loadCertificateData = async () => {
    try {
      // Get certificate by ID first
      const { data: certData, error: certError } = await db.getCertificateById(certificateId!);
      
      if (certError || !certData) {
        setError('Certificate not found');
        return;
      }

      setCertificate(certData);

      // Get user by ID (certificate owner)
      const { data: userData, error: userError } = await db.getUserProfile(certData.user_id);
      
      if (userError || !userData) {
        setError('User not found');
        return;
      }

      setUser(userData);

      // Check if certificate is public
      if (!certData.is_public) {
        setError('Certificate not found or not public');
        return;
      }

      // If username is provided, verify it matches the certificate owner
      if (username && username !== userData.username) {
        // If username doesn't match but certificate exists and is public,
        // redirect to the correct URL
        navigate(`/u/${userData.username}/certificate/${certificateId}`, { replace: true });
        return;
      }
    } catch (err) {
      console.error('Error loading certificate:', err);
      setError('Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: certificate?.title,
          text: `Check out my ${certificate?.title} certificate from ${certificate?.organization}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Certificate link copied to clipboard!');
    }
  };

  const handleDownload = async (format: 'pdf' | 'image') => {
    if (!certificate) return;
    
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
          setShowDownloadOptions(false);
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
          setShowDownloadOptions(false);
          return;
        }
        fileName = `${certificate.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      }
      
      // Try fetch and blob method first
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        
      } catch (fetchError) {
        // Fallback to direct link method
        console.log('Fetch failed, trying direct link method:', fetchError);
        
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      setShowDownloadOptions(false);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download certificate. Please try again.');
      setShowDownloadOptions(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { data: fileUrl } = storage.getPublicUrl(certificate.file_url);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to={user?.username ? `/u/${user.username}` : "/"}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                {user?.username ? 'Back to Portfolio' : 'Back to Home'}
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{certificate.title}</h1>
                <p className="text-gray-600">{certificate.organization}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {certificate.verification_code && (
                <button
                  onClick={() => setShowVerificationDetails(true)}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  <Shield className="h-4 w-4" />
                  <span>Verified</span>
                </button>
              )}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                >
                  Download
                </Button>
                
                {showDownloadOptions && (
                  <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                    <button
                      onClick={() => handleDownload('pdf')}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      <FileText className="h-4 w-4 mr-2 text-red-600" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleDownload('image')}
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
                onClick={handleShare}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Certificate Display */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {certificate.certificate_type === 'image' ? (
                <img
                  src={fileUrl.publicUrl}
                  alt={certificate.title}
                  className="w-full h-auto"
                />
              ) : (
                <iframe
                  src={fileUrl.publicUrl}
                  className="w-full h-[600px]"
                  title={certificate.title}
                />
              )}
            </div>
          </div>

          {/* Certificate Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Organization</p>
                    <p className="font-medium text-gray-900">{certificate.organization}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Issued On</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(certificate.issued_on), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <Tag className="h-4 w-4 mr-3 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Domain</p>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                      {certificate.domain}
                    </span>
                  </div>
                </div>
              </div>

              {certificate.verification_code && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowVerificationDetails(true)}
                    className="flex items-center text-green-600 hover:text-green-700 transition-colors duration-200"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">View Verification Details</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            {certificate.tags.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {certificate.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {certificate.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 leading-relaxed">{certificate.description}</p>
              </div>
            )}

            {/* Owner Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Owner</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.full_name || user?.username}</p>
                  {user?.username && (
                    <Link 
                      to={`/u/${user.username}`}
                      className="text-blue-600 hover:text-blue-700 text-sm transition-colors duration-200"
                    >
                      View Portfolio
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Details Modal */}
      {showVerificationDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Certificate Verification</h3>
              </div>
              <button
                onClick={() => setShowVerificationDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <VerificationQRCode 
                verificationCode={certificate.verification_code || ''} 
                certificateId={certificate.id}
              />
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-4">
                  <p>This certificate has been verified by Skillvento. Anyone can verify its authenticity using the QR code or verification code above.</p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowVerificationDetails(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close download options */}
      {showDownloadOptions && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowDownloadOptions(false)}
        />
      )}
    </div>
  );
};

export default CertificateViewer;