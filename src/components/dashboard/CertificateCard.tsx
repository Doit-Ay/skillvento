import React, { useState, useEffect } from 'react';
import { Calendar, Building, Tag, Eye, Edit, Trash2, ExternalLink, Share2, Download, FileText, Image as ImageIcon, X, Shield } from 'lucide-react';
import { Certificate } from '../../types';
import { storage } from '../../lib/supabase';
import { format } from 'date-fns';
import VerificationBadge from '../verification/VerificationBadge';
import VerificationQRCode from '../verification/VerificationQRCode';

interface CertificateCardProps {
  certificate: Certificate;
  onDelete: (id: string) => void;
  onEdit: (certificate: Certificate) => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, onDelete, onEdit }) => {
  const [imageError, setImageError] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showVerificationDetails, setShowVerificationDetails] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Get the username from localStorage for certificate viewing
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);
  }, []);

  const handleView = () => {
    // Open certificate in a new tab instead of a modal
    if (username) {
      window.open(`/u/${username}/certificate/${certificate.id}`, '_blank');
    } else {
      // If username is not available, fetch it from the profile
      const currentUser = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
      const userMetadata = currentUser?.currentSession?.user?.user_metadata;
      const fallbackUsername = userMetadata?.username || 'user';
      
      // Store it for future use
      localStorage.setItem('username', fallbackUsername);
      
      window.open(`/u/${fallbackUsername}/certificate/${certificate.id}`, '_blank');
    }
  };

  const handleShare = async () => {
    const { data: fileUrl } = storage.getPublicUrl(certificate.file_url);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: certificate.title,
          text: `Check out my ${certificate.title} certificate from ${certificate.organization}`,
          url: fileUrl.publicUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(fileUrl.publicUrl);
      alert('Certificate link copied to clipboard!');
    }
  };

  const handleDownload = async (format: 'pdf' | 'image') => {
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

  // Get the appropriate image URL for display (always use image version for thumbnails)
  const getDisplayImageUrl = () => {
    if (certificate.image_url) {
      return storage.getPublicUrl(certificate.image_url).data.publicUrl;
    } else if (certificate.thumbnail_url) {
      return storage.getPublicUrl(certificate.thumbnail_url).data.publicUrl;
    } else if (certificate.certificate_type === 'image') {
      return storage.getPublicUrl(certificate.file_url).data.publicUrl;
    }
    return null;
  };

  const displayImageUrl = getDisplayImageUrl();
  
  // Check if certificate is expiring soon (within 30 days)
  const isExpiringSoon = () => {
    if (!certificate.expiry_date) return false;
    
    const expiryDate = new Date(certificate.expiry_date);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    return expiryDate <= thirtyDaysFromNow && expiryDate > now;
  };
  
  // Check if certificate is expired
  const isExpired = () => {
    if (!certificate.expiry_date) return false;
    
    const expiryDate = new Date(certificate.expiry_date);
    const now = new Date();
    
    return expiryDate < now;
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group h-full flex flex-col">
        {/* Certificate Thumbnail - Fixed Height */}
        <div className="aspect-video bg-gray-100 overflow-hidden relative cursor-pointer flex-shrink-0" onClick={handleView}>
          {displayImageUrl && !imageError ? (
            <img
              src={displayImageUrl}
              alt={certificate.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 group-hover:from-red-100 group-hover:to-orange-100 transition-colors duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <ExternalLink className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-sm text-red-600 font-medium">
                  {certificate.certificate_type === 'pdf' ? 'PDF Certificate' : 'Certificate'}
                </p>
              </div>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <Eye className="h-4 w-4 inline mr-2" />
              View Certificate
            </button>
          </div>
          
          {/* Verification Badge */}
          {certificate.verification_code && (
            <div className="absolute top-2 right-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVerificationDetails(true);
                }}
                className="focus:outline-none"
              >
                <VerificationBadge certificate={certificate} size="sm" />
              </button>
            </div>
          )}
          
          {/* Expiry Badge */}
          {isExpiringSoon() && (
            <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              Expires Soon
            </div>
          )}
          
          {isExpired() && (
            <div className="absolute top-2 left-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              Expired
            </div>
          )}
        </div>

        {/* Certificate Info - Flexible Height */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Header with badges */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 mr-3">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight flex-1" style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '3.5rem' // Ensures consistent height for 2 lines
              }}>
                {certificate.title}
              </h3>
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              {certificate.is_verified && !certificate.verification_code && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
                  ✓ Verified
                </span>
              )}
              {certificate.is_public && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
                  Public
                </span>
              )}
            </div>
          </div>

          {/* Certificate Details - Fixed Height */}
          <div className="space-y-3 mb-6 flex-1">
            <div className="flex items-center text-sm text-gray-600">
              <Building className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
              <span className="font-medium truncate">{certificate.organization}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
              <span>{format(new Date(certificate.issued_on), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Tag className="h-4 w-4 mr-3 text-gray-400 flex-shrink-0" />
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium truncate">
                {certificate.domain}
              </span>
            </div>
          </div>

          {/* Actions - Fixed at Bottom */}
          <div className="border-t border-gray-100 pt-4 mt-auto">
            <div className="flex items-center justify-between">
              {/* Left side - Download and Share as icon buttons */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDownloadOptions(!showDownloadOptions);
                    }}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="Download certificate"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  
                  {/* Download Options Dropdown */}
                  {showDownloadOptions && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload('pdf');
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors duration-200"
                      >
                        <FileText className="h-4 w-4 mr-2 text-red-600" />
                        Download PDF
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload('image');
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors duration-200"
                      >
                        <ImageIcon className="h-4 w-4 mr-2 text-blue-600" />
                        Download Image
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  title="Share certificate"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              {/* Right side - Edit and Delete */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(certificate);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Edit certificate"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this certificate?')) {
                      onDelete(certificate.id);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Delete certificate"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
          className="fixed inset-0 z-10" 
          onClick={() => setShowDownloadOptions(false)}
        />
      )}
    </>
  );
};

export default CertificateCard;