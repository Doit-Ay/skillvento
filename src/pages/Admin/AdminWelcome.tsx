import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Mail, Shield, AlertCircle, Clock } from 'lucide-react';
import Button from '../../components/common/Button';

const AdminWelcome: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/admin11section/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 group mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Award className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Skillvento Admin
            </span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Admin Panel
          </h2>
          <p className="text-gray-600">
            Secure access to Skillvento administration dashboard
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <Shield className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Secure Access</h3>
              <p className="text-blue-700 text-sm">
                This area is restricted to authorized administrators only. All access attempts are logged for security purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Login Method */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start mb-4">
            <Mail className="h-6 w-6 text-purple-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Email Verification Login</h3>
              <p className="text-gray-600 text-sm">
                For enhanced security, we use email verification instead of passwords. A secure login link will be sent to your admin email.
              </p>
            </div>
          </div>
          
          <div className="flex items-start mb-4">
            <Clock className="h-6 w-6 text-orange-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Time-Limited Access</h3>
              <p className="text-gray-600 text-sm">
                Login links expire after 1 minute for security. You'll need to request a new link for each session.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Important Notice</h3>
              <p className="text-gray-600 text-sm">
                Only authorized administrators with verified email addresses can access this panel.
              </p>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleLoginClick}
            loading={isLoggingIn}
            className="w-full py-3 text-lg"
          >
            Proceed to Login
          </Button>
        </div>

        {/* Back to main site */}
        <div className="text-center">
          <a 
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            ← Return to main site
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminWelcome;