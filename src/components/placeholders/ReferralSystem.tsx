import React from 'react';
import { Gift } from 'lucide-react';

const ReferralSystem: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="bg-pink-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
        <Gift className="h-8 w-8 text-pink-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Referral System</h1>
      <p className="text-gray-600 max-w-md mx-auto">Coming Soon - Earn rewards by referring friends!</p>
    </div>
  </div>
);

export default ReferralSystem;