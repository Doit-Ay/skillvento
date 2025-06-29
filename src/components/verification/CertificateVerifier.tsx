import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, Shield, AlertTriangle } from 'lucide-react';
import { db, blockchain } from '../../lib/supabase';
import Button from '../common/Button';
import Input from '../common/Input';
import { Certificate } from '../../types';
import { format } from 'date-fns';

interface CertificateVerifierProps {
  onClose?: () => void;
}

const CertificateVerifier: React.FC<CertificateVerifierProps> = ({ onClose }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [owner, setOwner] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'failed' | null>(null);
  const [blockchainVerified, setBlockchainVerified] = useState<boolean | null>(null);
  const [blockchainVerificationAttempted, setBlockchainVerificationAttempted] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError('Please enter a verification code');
      return;
    }
    
    setLoading(true);
    setError('');
    setVerificationStatus(null);
    setCertificate(null);
    setOwner(null);
    setBlockchainVerified(null);
    setBlockchainVerificationAttempted(false);
    
    try {
      // Verify the certificate using the verification code
      const { data, error: verifyError } = await db.verifyCertificate(verificationCode.trim());
      
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
        verification_code: verificationCode.trim(),
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-2xl w-full">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6" />
            <h2 className="text-xl font-bold">Certificate Verification</h2>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
        <p className="mt-2 text-blue-100">
          Verify the authenticity of any certificate issued through Skillvento
        </p>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleVerify} className="mb-6">
          <div className="mb-4">
            <Input
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter the certificate verification code"
              icon={Search}
              fullWidth
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The verification code can be found on the certificate or provided by the certificate owner
            </p>
          </div>
          
          <Button
            type="submit"
            loading={loading}
            fullWidth
          >
            Verify Certificate
          </Button>
        </form>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}
        
        {verificationStatus === 'failed' && (
          <div className="text-center py-6">
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Failed</h3>
            <p className="text-gray-600">
              We couldn't verify this certificate. Please check the verification code and try again.
            </p>
          </div>
        )}
        
        {verificationStatus === 'verified' && certificate && (
          <div className="border border-green-200 rounded-lg overflow-hidden">
            <div className="bg-green-50 p-4 border-b border-green-200 flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">Certificate Verified</h3>
              </div>
              
              {blockchainVerificationAttempted && (
                <div className={`px-2 py-1 rounded text-xs font-medium ${
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
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Certificate Title</h4>
                  <p className="text-gray-900">{certificate.title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Issuing Organization</h4>
                  <p className="text-gray-900">{certificate.organization}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Issue Date</h4>
                  <p className="text-gray-900">{format(new Date(certificate.issued_on), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Certificate ID</h4>
                  <p className="text-gray-900 font-mono text-xs">{certificate.id}</p>
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
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-700">
                        Blockchain verification is currently unavailable. This does not affect the validity of the certificate.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/u/${owner?.username}/certificate/${certificate.id}`, '_blank')}
                  fullWidth
                >
                  View Certificate
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2">About Certificate Verification</h3>
          <p className="text-xs text-gray-600 mb-2">
            Skillvento's verification system ensures the authenticity of certificates through:
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
              </div>
              <span>Unique verification codes for each certificate</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
              </div>
              <span>Blockchain verification for tamper-proof records</span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
              </div>
              <span>Direct verification with issuing organizations</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerifier;