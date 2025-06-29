import React from 'react';
import { QrCode } from 'lucide-react';

const QRCodeSharing: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="bg-indigo-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
        <QrCode className="h-8 w-8 text-indigo-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">QR Code Sharing</h1>
      <p className="text-gray-600 max-w-md mx-auto">Coming Soon - Generate QR codes for instant sharing!</p>
    </div>
  </div>
);

export default QRCodeSharing;