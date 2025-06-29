import React from 'react';
import { Award } from 'lucide-react';

const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Award className="h-8 w-8 text-blue-600 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">Loading content...</p>
    </div>
  </div>
);

export default LoadingFallback;