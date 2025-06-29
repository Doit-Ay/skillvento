import React from 'react';
import { Crown } from 'lucide-react';

const Premium: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="bg-amber-100 p-4 rounded-full inline-flex items-center justify-center mb-4">
        <Crown className="h-8 w-8 text-amber-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Premium Features</h1>
      <p className="text-gray-600 max-w-md mx-auto">Coming Soon - Unlock unlimited potential!</p>
    </div>
  </div>
);

export default Premium;