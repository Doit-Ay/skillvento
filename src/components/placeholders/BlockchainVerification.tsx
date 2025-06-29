import React from 'react';
import { Shield } from 'lucide-react';

const BlockchainVerification: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="bg-green-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
        <Shield className="h-8 w-8 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Blockchain Verification</h1>
      <p className="text-gray-600 max-w-md mx-auto">Coming Soon - Verify certificates with blockchain technology!</p>
    </div>
  </div>
);

export default BlockchainVerification;