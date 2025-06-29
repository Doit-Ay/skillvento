import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  FileText, 
  TrendingUp, 
  Users, 
  Share2, 
  Shield, 
  Zap, 
  Brain,
  QrCode,
  Gift,
  Crown,
  MessageSquare
} from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Award,
      title: 'Certificate Vault',
      description: 'Securely store and organize all your certificates, diplomas, and achievements in one beautiful dashboard.',
      color: 'from-blue-500 to-blue-600',
      link: '/certificate-vault'
    },
    {
      icon: FileText,
      title: 'AI Resume Builder',
      description: 'Generate professional resumes automatically from your certificates and profile data with multiple templates.',
      color: 'from-green-500 to-green-600',
      link: '/resume'
    },
    {
      icon: TrendingUp,
      title: 'Skill Analytics',
      description: 'Visualize your learning journey with interactive charts showing skill progress and certification trends.',
      color: 'from-purple-500 to-purple-600',
      link: '/analytics'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Create teams, share achievements, and build collective portfolios for hackathons and group projects.',
      color: 'from-orange-500 to-orange-600',
      link: '/team-collaboration'
    },
    {
      icon: Share2,
      title: 'Shareable Portfolios',
      description: 'Beautiful public profiles with custom URLs that showcase your professional journey to employers.',
      color: 'from-pink-500 to-pink-600',
      link: '/portfolio-builder'
    },
    {
      icon: Shield,
      title: 'Blockchain Verification',
      description: 'Verify certificate authenticity using blockchain technology to prevent fraud and build trust.',
      color: 'from-indigo-500 to-indigo-600',
      link: '/blockchain-verification'
    },
    {
      icon: Brain,
      title: 'AI Career Mentor',
      description: 'Get personalized career advice, skill recommendations, and learning paths powered by AI.',
      color: 'from-teal-500 to-teal-600',
      link: '/ai-career-mentor'
    },
    {
      icon: MessageSquare,
      title: 'Reddit Integration',
      description: 'Share your achievements on Reddit, participate in weekly leaderboards, and connect with the community.',
      color: 'from-red-500 to-red-600',
      link: '/reddit-integration'
    },
    {
      icon: QrCode,
      title: 'QR Code Sharing',
      description: 'Generate QR codes for your portfolio to share instantly at networking events and job interviews.',
      color: 'from-gray-500 to-gray-600',
      link: '/qr-code-sharing'
    },
    {
      icon: Gift,
      title: 'Referral System',
      description: 'Earn extra upload credits by inviting friends. Both you and your referrals get bonus storage.',
      color: 'from-yellow-500 to-yellow-600',
      link: '/referral-system'
    },
    {
      icon: Crown,
      title: 'Premium Features',
      description: 'Unlock unlimited uploads, premium templates, advanced analytics, and priority support.',
      color: 'from-amber-500 to-amber-600',
      link: '/premium'
    },
    {
      icon: Zap,
      title: 'Smart Automation',
      description: 'Automatically categorize certificates, suggest tags, and detect skill improvements over time.',
      color: 'from-cyan-500 to-cyan-600',
      link: '/smart-automation'
    }
  ];

  return (
    <div className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Showcase Your Growth</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From certificate management to AI-powered career insights, Skillvento provides all the tools 
            you need to build an impressive professional portfolio.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              
              <div className="mt-4 text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Explore feature →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;