import React from 'react';
import { Award, Shield, Search, Upload, Download, Share2, Eye, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Check from '../components/placeholders/Check';

const CertificateVault: React.FC = () => {
  const features = [
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Drag and drop your certificates in PDF or image format. We automatically convert and store both versions.'
    },
    {
      icon: Shield,
      title: 'Secure Storage',
      description: 'Your certificates are stored securely with enterprise-grade encryption and backup systems.'
    },
    {
      icon: Search,
      title: 'Smart Organization',
      description: 'Automatically categorize and tag your certificates. Find any certificate instantly with powerful search.'
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      description: 'Share individual certificates or your entire portfolio with employers, colleagues, or on social media.'
    },
    {
      icon: Download,
      title: 'Multiple Formats',
      description: 'Download your certificates in PDF or image format. Perfect for applications and presentations.'
    },
    {
      icon: Eye,
      title: 'Beautiful Display',
      description: 'Showcase your certificates in a professional portfolio that highlights your achievements.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Award className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Certificate Vault
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Your secure digital vault for all certificates, diplomas, and professional achievements. 
              Never lose an important document again.
            </p>
            <div className="mt-8">
              <Link to="/dashboard">
                <Button 
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 border-0"
                >
                  Try It Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Certificates
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From upload to sharing, we've got every aspect of certificate management covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to get your certificates organized</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload</h3>
              <p className="text-gray-600">
                Drag and drop your certificates or click to browse. We support PDF and image formats.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Organize</h3>
              <p className="text-gray-600">
                Add details like title, organization, date, and tags. Our AI helps with automatic categorization.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Share</h3>
              <p className="text-gray-600">
                Create a beautiful portfolio or share individual certificates with potential employers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">See It In Action</h2>
              <p className="text-gray-600 mb-6">
                Experience how easy it is to upload, organize, and share your certificates with Skillvento's Certificate Vault.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mt-1 mr-3">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Automatic Organization</h4>
                    <p className="text-sm text-gray-600">Our AI automatically categorizes your certificates by domain and skill area</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mt-1 mr-3">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Format Conversion</h4>
                    <p className="text-sm text-gray-600">We automatically convert between PDF and image formats for maximum compatibility</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mt-1 mr-3">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Verification System</h4>
                    <p className="text-sm text-gray-600">Add verification codes to your certificates for enhanced credibility</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/dashboard">
                  <Button 
                    icon={ArrowRight} 
                    iconPosition="right"
                  >
                    Try Certificate Vault Now
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
              <img 
                src="https://images.pexels.com/photos/6804604/pexels-photo-6804604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Certificate Vault Demo" 
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
            <div className="text-center">
              <Lock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Certificates Are Safe With Us
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                We use enterprise-grade security measures to protect your valuable documents. 
                Your certificates are encrypted, backed up, and accessible only to you.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Encrypted Storage</h4>
                  <p className="text-sm text-gray-600">End-to-end encryption</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Verified Backups</h4>
                  <p className="text-sm text-gray-600">Multiple backup locations</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Lock className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Privacy Controls</h4>
                  <p className="text-sm text-gray-600">You control who sees what</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Organize Your Certificates?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust Skillvento to keep their achievements safe and organized.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 border-0 px-8"
              >
                Start Free
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white/10 px-8"
              >
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateVault;