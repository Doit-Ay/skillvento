import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Award } from 'lucide-react';
import { auth, db } from './lib/supabase';
import type { User } from './types';
import Navbar from './components/layout/Navbar';
import LoadingSpinner from './components/placeholders/LoadingSpinner';
import LoadingFallback from './components/placeholders/LoadingFallback';

// Lazy load components to improve initial load time
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const About = lazy(() => import('./pages/About'));
const Features = lazy(() => import('./pages/Features'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const Profile = lazy(() => import('./pages/Profile'));
const CertificateViewer = lazy(() => import('./pages/CertificateViewer'));
const Analytics = lazy(() => import('./pages/Analytics'));
const CertificateVault = lazy(() => import('./pages/CertificateVault'));
const Teams = lazy(() => import('./pages/Teams'));
const TeamDetail = lazy(() => import('./pages/TeamDetail'));
const Settings = lazy(() => import('./pages/Settings'));
const Verify = lazy(() => import('./pages/Verify'));

// Admin Pages
const AdminWelcome = lazy(() => import('./pages/Admin/AdminWelcome'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminAnalytics = lazy(() => import('./pages/Admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('./pages/Admin/AdminSettings'));
const AdminRedirect = lazy(() => import('./pages/Admin/AdminRedirect'));

// Placeholder pages for feature links
const TeamCollaboration = lazy(() => import('./components/placeholders/TeamCollaboration'));
const PortfolioBuilder = lazy(() => import('./components/placeholders/PortfolioBuilder'));
const BlockchainVerification = lazy(() => import('./components/placeholders/BlockchainVerification'));
const AICareerMentor = lazy(() => import('./components/placeholders/AICareerMentor'));
const RedditIntegration = lazy(() => import('./components/placeholders/RedditIntegration'));
const QRCodeSharing = lazy(() => import('./components/placeholders/QRCodeSharing'));
const ReferralSystem = lazy(() => import('./components/placeholders/ReferralSystem'));
const Premium = lazy(() => import('./components/placeholders/Premium'));
const SmartAutomation = lazy(() => import('./components/placeholders/SmartAutomation'));

// Component to handle OAuth callback and referral processing
const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const referralCode = searchParams.get('ref');
      
      if (referralCode) {
        // Wait a bit for the user to be authenticated
        setTimeout(async () => {
          try {
            const user = await auth.getCurrentUser();
            if (user) {
              await db.processReferral(user.id, referralCode);
            }
          } catch (error) {
            console.error('Error processing referral after OAuth:', error);
          }
        }, 2000);
      }
    };

    handleOAuthCallback();
  }, [searchParams]);

  return null;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Check current auth state
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const currentUser = await auth.getCurrentUser();
        if (currentUser) {
          console.log('User is authenticated:', currentUser);
          setUser(currentUser as User);
          setIsAuthenticated(true);
          
          // Store username in localStorage for certificate viewing
          const { data: profile } = await db.getUserProfile(currentUser.id);
          if (profile?.username) {
            localStorage.setItem('username', profile.username);
          }
        } else {
          console.log('No authenticated user found');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        // Mark auth as initialized and remove loading state
        setAuthInitialized(true);
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session.user);
        setUser(session.user as User);
        setIsAuthenticated(true);
        
        // Get and store username
        const { data: profile } = await db.getUserProfile(session.user.id);
        if (profile?.username) {
          localStorage.setItem('username', profile.username);
        }
        
        // Check for referral processing after OAuth sign-in
        const urlParams = new URLSearchParams(window.location.search);
        const referralCode = urlParams.get('ref');
        
        if (referralCode && session.user) {
          try {
            await db.processReferral(session.user.id, referralCode);
          } catch (error) {
            console.error('Error processing referral:', error);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('username');
      }
      
      // Mark auth as initialized and remove loading state
      setAuthInitialized(true);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Show loading spinner while authentication is being checked
  if (loading || !authInitialized) {
    return <LoadingSpinner message="Initializing Skillvento..." />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Only show navbar on non-admin pages */}
        {!window.location.pathname.startsWith('/admin11section') && (
          <Navbar user={user} isAuthenticated={isAuthenticated} />
        )}
        <OAuthCallback />
        
        <main className="flex-1">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
              />
              <Route 
                path="/signup" 
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} 
              />
              <Route 
                path="/dashboard" 
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/resume" 
                element={isAuthenticated ? <ResumeBuilder /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/analytics" 
                element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/profile/setup" 
                element={isAuthenticated ? <ProfileSetup /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/profile" 
                element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
              />
              <Route path="/u/:username" element={<Portfolio />} />
              <Route path="/u/:username/resume" element={<Portfolio />} />
              <Route path="/u/:username/certificate/:certificateId" element={<CertificateViewer />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/verify" element={<Verify />} />
              
              {/* Team Routes */}
              <Route 
                path="/teams" 
                element={isAuthenticated ? <Teams /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/teams/:teamId" 
                element={isAuthenticated ? <TeamDetail /> : <Navigate to="/login" />} 
              />
              
              {/* Settings Routes */}
              <Route 
                path="/settings" 
                element={isAuthenticated ? <Navigate to="/settings/profile" /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/settings/:section" 
                element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} 
              />
              
              {/* Feature Pages */}
              <Route path="/certificate-vault" element={<CertificateVault />} />
              <Route path="/team-collaboration" element={<TeamCollaboration />} />
              <Route path="/portfolio-builder" element={<PortfolioBuilder />} />
              <Route path="/blockchain-verification" element={<BlockchainVerification />} />
              <Route path="/ai-career-mentor" element={<AICareerMentor />} />
              <Route path="/reddit-integration" element={<RedditIntegration />} />
              <Route path="/qr-code-sharing" element={<QRCodeSharing />} />
              <Route path="/referral-system" element={<ReferralSystem />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/smart-automation" element={<SmartAutomation />} />
              
              {/* Admin Routes */}
              <Route path="/admin11section" element={<AdminWelcome />} />
              <Route path="/admin11section/login" element={<AdminLogin />} />
              <Route path="/admin11section/dashboard" element={<AdminDashboard />} />
              <Route path="/admin11section/analytics" element={<AdminAnalytics />} />
              <Route path="/admin11section/settings" element={<AdminSettings />} />
              <Route path="/admin11section/redirect" element={<AdminRedirect />} />
              
              <Route path="/terms" element={<div className="p-8"><h1>Terms of Service</h1></div>} />
              <Route path="/privacy" element={<div className="p-8"><h1>Privacy Policy</h1></div>} />
            </Routes>
          </Suspense>
        </main>
        
        {/* ONLY SHOW FOOTER ON NON-PORTFOLIO AND NON-ADMIN PAGES */}
        {!window.location.pathname.startsWith('/u/') && !window.location.pathname.startsWith('/admin11section') && (
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold">Skillvento</span>
                  </div>
                  <p className="text-gray-400 mb-6 max-w-md">
                    The smart way to showcase your professional journey. Build, share, and grow your career with AI-powered insights.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Product</h3>
                  <ul className="space-y-3">
                    <li><a href="/features" className="text-gray-400 hover:text-white transition-colors duration-200">Features</a></li>
                    <li><a href="/pricing" className="text-gray-400 hover:text-white transition-colors duration-200">Pricing</a></li>
                    <li><a href="/templates" className="text-gray-400 hover:text-white transition-colors duration-200">Templates</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Company</h3>
                  <ul className="space-y-3">
                    <li><a href="/about" className="text-gray-400 hover:text-white transition-colors duration-200">About</a></li>
                    <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">Contact</a></li>
                    <li><a href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy</a></li>
                    <li><a href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">Terms</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                <p className="text-gray-400 text-sm">
                  © 2024 Skillvento. All rights reserved. Made with ❤️ for students and professionals.
                </p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </Router>
  );
}

export default App;