import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Award, 
  User, 
  LogOut, 
  FileText, 
  BarChart3, 
  Settings, 
  ExternalLink,
  Bell,
  Users,
  Shield
} from 'lucide-react';
import { auth, db } from '../../lib/supabase';
import type { User as UserType } from '../../types';
import NotificationBell from '../notifications/NotificationBell';

interface NavbarProps {
  user?: UserType | null;
  isAuthenticated?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, isAuthenticated }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkUnreadNotifications();
    }
    
    // Add click outside listener for profile menu
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAuthenticated, user]);

  const checkUnreadNotifications = async () => {
    try {
      const { data } = await db.getUserNotifications(user!.id);
      setUnreadNotifications(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/');
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'About', href: '/about' },
  ];

  const dashboardLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Award },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Resume Builder', href: '/resume', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Verify', href: '/verify', icon: Shield },
  ];

  // Get display name for title
  const getDisplayName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.username) return user.username;
    return 'User';
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Award className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Skillvento
            </span>
            {/* Show user name in title bar when authenticated */}
            {isAuthenticated && user && (
              <span className="hidden md:block text-gray-600 text-sm ml-2">
                - {getDisplayName()}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                {dashboardLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 relative group flex items-center space-x-1"
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.name}</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
                  </Link>
                ))}
              </>
            ) : (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">{getDisplayName()}</span>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/settings/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      {user.username && (
                        <Link
                          to={`/u/${user.username}`}
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Portfolio
                        </Link>
                      )}
                      <hr className="my-2" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-4">
              {isAuthenticated ? (
                <>
                  {dashboardLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <link.icon className="h-4 w-4" />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="block text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </>
              )}
              
              {isAuthenticated && user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">{getDisplayName()}</span>
                  </div>
                  <Link
                    to="/profile"
                    className="block text-gray-600 hover:text-blue-600 font-medium mb-2 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings/profile"
                    className="block text-gray-600 hover:text-blue-600 font-medium mb-2 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  {user.username && (
                    <Link
                      to={`/u/${user.username}`}
                      className="block text-gray-600 hover:text-blue-600 font-medium mb-2 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      View Portfolio
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Link
                    to="/login"
                    className="block text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;