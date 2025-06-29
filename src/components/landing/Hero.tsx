import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Users, TrendingUp, Shield, Star, FileText, Brain, QrCode, Gift } from 'lucide-react';
import Button from '../common/Button';

const Hero: React.FC = () => {
  const features = [
    { icon: Award, text: 'Certificate Vault', link: '/certificate-vault' },
    { icon: TrendingUp, text: 'AI Career Insights', link: '/ai-career-mentor' },
    { icon: Users, text: 'Team Collaboration', link: '/team-collaboration' },
    { icon: Shield, text: 'Blockchain Verified', link: '/blockchain-verification' },
    { icon: FileText, text: 'Resume Builder', link: '/resume' },
    { icon: QrCode, text: 'QR Code Sharing', link: '/qr-code-sharing' },
  ];

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8 animate-bounce-slow">
            <Award className="h-4 w-4 mr-2" />
            AI-Powered Growth Platform
            <Star className="h-4 w-4 ml-2 text-yellow-500" />
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Professional Journey,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Beautifully Organized
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Build your digital portfolio, showcase certificates, and accelerate your career with AI-powered insights. 
            Join thousands of professionals who trust Skillvento to showcase their growth.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button size="lg" icon={ArrowRight} iconPosition="right" className="text-lg px-8 py-4 shadow-lg hover:shadow-xl">
                Start Building for Free
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 hover:shadow-md">
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="flex items-center space-x-2 text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105"
              >
                <feature.icon className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{feature.text}</span>
              </Link>
            ))}
          </div>

          {/* Hero Image/Demo */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 text-center">
                  <span className="text-gray-300 text-sm">skillvento.com</span>
                </div>
              </div>
              
              {/* Dashboard Preview */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Certificate Cards */}
                  {[
                    { title: 'React Development', org: 'Meta', year: '2024', color: 'from-blue-500 to-blue-600' },
                    { title: 'AWS Cloud Practitioner', org: 'Amazon', year: '2024', color: 'from-orange-500 to-orange-600' },
                    { title: 'UI/UX Design', org: 'Google', year: '2023', color: 'from-green-500 to-green-600' }
                  ].map((cert, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${cert.color} rounded-lg flex items-center justify-center`}>
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{cert.title}</h3>
                          <p className="text-gray-500 text-xs">{cert.org} • {cert.year}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>
                        <span className="text-gray-400 text-xs">View</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center bg-white/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">15</div>
                    <div className="text-gray-500 text-sm">Certificates</div>
                  </div>
                  <div className="text-center bg-white/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-600">8</div>
                    <div className="text-gray-500 text-sm">Skills</div>
                  </div>
                  <div className="text-center bg-white/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <div className="text-gray-500 text-sm">Profile Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-16">
            <p className="text-gray-500 mb-8">Trusted by professionals from</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Apple'].map((company) => (
                <div key={company} className="text-gray-400 font-semibold text-lg hover:text-gray-600 transition-colors duration-200 cursor-pointer">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;