import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from '../common/Button';

interface DemoAuthNoticeProps {
  onClose: () => void;
}

const DemoAuthNotice: React.FC<DemoAuthNoticeProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-yellow-100 p-2 rounded-full">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Demo Mode Active</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          This is a demo application running in development mode. Authentication is simulated and no real data is being stored.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700">
            <strong>For a real application:</strong> You would need to set up a Supabase project and configure the authentication providers in your Supabase dashboard.
          </p>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onClose}>
            Continue to Demo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DemoAuthNotice;