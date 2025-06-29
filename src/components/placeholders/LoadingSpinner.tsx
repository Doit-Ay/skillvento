import React from 'react';
import { Award } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  fullScreen = true,
  message = 'Loading...'
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'py-12'} bg-gradient-to-br from-blue-50 to-purple-50`}>
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Award className="h-8 w-8 text-blue-600 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
      <div className="mt-2 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;