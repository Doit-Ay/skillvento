import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Award, AlertCircle } from 'lucide-react';
import { auth } from '../../lib/supabase';
import LoadingSpinner from '../../components/placeholders/LoadingSpinner';

const AdminRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if this was an admin login attempt
        const isAdminLoginAttempt = localStorage.getItem('admin_login_attempt') === 'true';
        
        // Clear the admin login attempt flag
        localStorage.removeItem('admin_login_attempt');
        
        // Check if user is authenticated with Supabase
        const user = await auth.getCurrentUser();
        
        if (user) {
          console.log("User authenticated:", user.email);
          
          // Check if this user has admin rights
          // In a real app, you would check against a database of admin users
          if (user.email === 'aditya2987ahir@gmail.com' || user.email === 'admin@skillvento.com') {
            console.log("Admin user confirmed");
            localStorage.setItem('skillvento_admin_auth', 'admin123');
            localStorage.setItem('skillvento_admin_email', user.email);
            
            // Redirect to admin dashboard
            setTimeout(() => {
              navigate('/admin11section/dashboard');
            }, 1000);
            return;
          } else if (isAdminLoginAttempt) {
            // User is authenticated but not an admin, and they were trying to access admin
            setError('This account does not have admin privileges');
            setTimeout(() => {
              navigate('/admin11section/login');
            }, 3000);
            return;
          }
        }
        
        // Check if admin is logged in via localStorage
        const adminAuth = localStorage.getItem('skillvento_admin_auth');
        if (adminAuth === 'admin123') {
          navigate('/admin11section/dashboard');
          return;
        }
        
        // If we reach here, redirect to login
        navigate('/admin11section/login');
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Authentication error. Please try again.');
        setTimeout(() => {
          navigate('/admin11section/login');
        }, 3000);
      } finally {
        // Set loading to false after a short delay to prevent flash of content
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };
    
    checkAuth();
  }, [navigate, location]);

  // If we're still loading, show a loading screen
  if (isLoading) {
    return <LoadingSpinner message="Verifying authentication..." />;
  }

  // This should never render as we always redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 group mb-6">
          <div className="bg-white p-3 rounded-xl group-hover:scale-105 transition-transform duration-200">
            <Award className="h-8 w-8 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-white">
            Skillvento Admin
          </span>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mt-4 max-w-xs mx-auto flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <p className="text-white mt-4">Redirecting...</p>
      </div>
    </div>
  );
};

export default AdminRedirect;