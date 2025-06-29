import React from 'react';
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
  MessageSquare,
  Upload,
  Search,
  BarChart3,
  Globe,
  Smartphone,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const Features: React.FC = () => {
  const mainFeatures = [
    {
      icon: Award,
      title: 'Certificate Vault',
      description: 'Securely store and organize all your certificates, diplomas, and achievements in one beautiful dashboard.',
      features: [
        'Upload PDF and image certificates',
        'Smart categorization and tagging',
        'Advanced search and filtering',
        'Bulk upload capabilities'
      ],
      color: 'from-blue-500 to-blue-600',
      link: '/certificate-vault'
    },
    {
      icon: FileText,
      title: 'AI Resume Builder',
      description: 'Generate professional resumes automatically from your certificates and profile data with multiple templates.',
      features: [
        'AI-powered content generation',
        '5+ professional templates',
        'Real-time preview and editing',
        'PDF export and sharing'
      ],
      color: 'from-green-500 to-green-600',
      link: '/resume'
    },
    {
      icon: TrendingUp,
      title: 'Skill Analytics',
      description: 'Visualize your learning journey with interactive charts showing skill progress and certification trends.',
      features: [
        'Progress tracking over time',
        'Skill gap analysis',
        'Learning recommendations',
        'Achievement milestones'
      ],
      color: 'from-purple-500 to-purple-600',
      link: '/analytics'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Create teams, share achievements, and build collective portfolios for hackathons and group projects.',
      features: [
        'Team portfolio creation',
        'Shared achievement tracking',
        'Collaboration tools',
        'Group analytics'
      ],
      color: 'from-orange-500 to-orange-600',
      link: '/teams'
    }
  ];

  const additionalFeatures = [
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

  const benefits = [
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Drag and drop your certificates with automatic metadata extraction'
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find any certificate instantly with powerful search and filtering'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Visualize your learning journey with detailed analytics'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Access your portfolio from anywhere, on any device'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Fully responsive design that works perfectly on mobile'
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with granular privacy controls'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Professional Growth</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to organize, showcase, and leverage your achievements for career success.
            </p>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The essential tools that make Skillvento the ultimate platform for professional portfolio management.
            </p>
          </div>

          <div className="space-y-20">
            {mainFeatures.map((feature, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                <div className="flex-1">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-xl text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-3 mb-6">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to={feature.link}>
                    <Button 
                      variant="outline" 
                      icon={ArrowRight} 
                      iconPosition="right"
                      className="mt-2"
                    >
                      Explore {feature.title}
                    </Button>
                  </Link>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 h-80 flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <feature.icon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Feature Demo</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Features Grid */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Capabilities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cutting-edge features that set Skillvento apart from traditional portfolio platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 group"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                <div className="mt-4 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Explore feature →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Skillvento?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with modern professionals in mind, designed for the future of work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Career?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are already using Skillvento to showcase their achievements 
            and accelerate their careers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 border-0 px-8"
              >
                Start Free Trial
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10 px-8"
              >
                Explore Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;