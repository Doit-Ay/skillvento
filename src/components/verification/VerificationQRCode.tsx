import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check } from 'lucide-react';
import Button from '../common/Button';

interface VerificationQRCodeProps {
  verificationCode: string;
  certificateId: string;
}

const VerificationQRCode: React.FC<VerificationQRCodeProps> = ({ verificationCode, certificateId }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    generateQRCode();
  }, [verificationCode]);
  
  const generateQRCode = async () => {
    try {
      // Create verification URL
      const verificationUrl = `${window.location.origin}/verify?code=${verificationCode}`;
      
      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#3B82F6',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };
  
  const copyVerificationCode = async () => {
    try {
      await navigator.clipboard.writeText(verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };
  
  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `certificate-verification-${certificateId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Verification</h3>
      
      <div className="flex flex-col items-center mb-6">
        {qrCodeUrl ? (
          <img 
            src={qrCodeUrl} 
            alt="Verification QR Code" 
            className="w-40 h-40 mb-4"
          />
        ) : (
          <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-gray-400">Loading...</span>
          </div>
        )}
        
        <div className="flex items-center bg-gray-100 rounded-lg p-2 w-full">
          <span className="font-mono text-sm text-gray-700 px-2 flex-1 overflow-hidden text-ellipsis">
            {verificationCode}
          </span>
          <button
            onClick={copyVerificationCode}
            className="p-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            title="Copy verification code"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-6">
        <p>Share this QR code or verification code with anyone who needs to verify this certificate's authenticity.</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          icon={Download}
          onClick={downloadQRCode}
          fullWidth
        >
          Download QR Code
        </Button>
        <Button
          variant="outline"
          onClick={() => window.open(`/verify?code=${verificationCode}`, '_blank')}
          fullWidth
        >
          Verify Certificate
        </Button>
      </div>
    </div>
  );
};

export default VerificationQRCode;