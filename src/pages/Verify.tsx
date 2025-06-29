import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Award, Shield, CheckCircle, XCircle, Clock, ArrowLeft, AlertTriangle } from 'lucide-react';
import { db, blockchain } from '../lib/supabase';
import { Certificate } from '../types';
import { format } from 'date-fns';
import Button from '../components/common/Button';
import CertificateVerifier from '../components/verification/CertificateVerifier';

const Verify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const verificationCode = searchParams.get('code');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [owner, setOwner] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed' | null>(null);
  const [blockchainVerified, setBlockchainVerified] = useState<boolean | null>(null);
  const [blockchainVerificationAttempted, setBlockchainVerificationAttempted] = useState(false);
  
  useEffect(() => {
    if (verificationCode) {
      verifyCertificate(verificationCode);
    }
  }, [verificationCode]);
  
  const verifyCertificate = async (code: string) => {
    setLoading(true);
    setError('');
    setVerificationStatus(null);
    setCertificate(null);
    setOwner(null);
    setBlockchainVerified(null);
    setBlockchainVerificationAttempted(false);
    
    try {
      // Verify the certificate using the verification code
      const { data, error: verifyError } = await db.verifyCertificate(code);
      
      if (verifyError || !data) {
        throw new Error('Certificate not found or verification code is invalid');
      }
      
      // Extract certificate and owner data
      const cert = data;
      const ownerData = data.profiles;
      delete cert.profiles;
      
      setCertificate(cert);
      setOwner(ownerData);
      
      // Check blockchain verification if hash exists
      if (cert.blockchain_hash) {
        try {
          setBlockchainVerificationAttempted(true);
          const isVerified = await blockchain.verifyCertificateHash(cert, cert.blockchain_hash);
          setBlockchainVerified(isVerified);
        } catch (blockchainError) {
          console.error('Blockchain verification error:', blockchainError);
          setBlockchainVerified(false);
          setBlockchainVerificationAttempted(true);
        }
      }
      
      // Set verification status
      setVerificationStatus('verified');
      
      // Create verification request record
      await db.createVerificationRequest({
        certificate_id: cert.id,
        requester_email: 'anonymous@verification.com', // In a real app, you'd collect this
        verification_code: code,
        status: 'approved'
      });
      
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify certificate');
      setVerificationStatus('failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link to="/" className="text-white/80 hover:text-white flex items-center">
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span>Back to Home</span>
            </Link>
          </div>
          
          <div className="text-center">
            <Shield className="h-16 w-16 text-white/90 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Certificate Verification</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Verify the authenticity of any certificate issued through Skillvento
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-12">
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          {verificationCode ? (
            <div>
              {loading ? (
                <div className="p-12 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h3>
                  <p className="text-gray-600 mb-6">
                    {error}
                  </p>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/verify'}
                    >
                      Try Another Code
                    </Button>
                  </div>
                </div>
              ) : certificate ? (
                <div>
                  <div className="bg-green-50 p-6 border-b border-green-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                      <h3 className="text-xl font-semibold text-green-800">Certificate Verified</h3>
                    </div>
                    {blockchainVerificationAttempted && (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        blockchainVerified 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blockchainVerified 
                          ? 'Blockchain Verified' 
                          : 'Blockchain Verification Unavailable' 
                        }
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Certificate Title</h4>
                        <p className="text-lg font-semibold text-gray-900">{certificate.title}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Issuing Organization</h4>
                        <p className="text-lg font-semibold text-gray-900">{certificate.organization}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Issue Date</h4>
                        <p className="text-gray-900">{format(new Date(certificate.issued_on), 'MMMM dd, yyyy')}</p>
                      </div>
                      {certificate.expiry_date && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Expiry Date</h4>
                          <p className="text-gray-900">{format(new Date(certificate.expiry_date), 'MMMM dd, yyyy')}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Certificate ID</h4>
                        <p className="text-gray-900 font-mono text-sm">{certificate.id}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Verification Code</h4>
                        <p className="text-gray-900 font-mono text-sm">{certificate.verification_code}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Certificate Owner</h4>
                        <p className="text-gray-900">{owner?.full_name || owner?.username || 'Verified User'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Domain</h4>
                        <p className="text-gray-900">{certificate.domain}</p>
                      </div>
                    </div>
                    
                    {blockchainVerificationAttempted && !blockchainVerified && certificate.blockchain_hash && (
                      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-yellow-800">Blockchain Verification Note</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                              Blockchain verification is currently unavailable. This does not affect the validity of the certificate, which has been verified through our secure database.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          variant="outline"
                          onClick={() => window.location.href = '/verify'}
                          fullWidth
                        >
                          Verify Another Certificate
                        </Button>
                        
                        {owner?.username && (
                          <Button
                            onClick={() => window.open(`/u/${owner.username}/certificate/${certificate.id}`, '_blank')}
                            fullWidth
                          >
                            View Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <CertificateVerifier />
            </div>
          )}
        </div>
        
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About Our Verification System</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-blue-900">Secure Verification</h3>
              </div>
              <p className="text-sm text-blue-700">
                Each certificate has a unique verification code that can be used to confirm its authenticity.
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-medium text-green-900">Blockchain Verification</h3>
              </div>
              <p className="text-sm text-green-700">
                Selected certificates are secured on the blockchain, providing an immutable record of achievement.
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <Award className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium text-purple-900">Trusted Issuers</h3>
              </div>
              <p className="text-sm text-purple-700">
                We work with trusted organizations to ensure the validity of certificates in our system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;