import React from 'react';
import { TrendingUp, Users, Award, Globe, Shield, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

const Stats: React.FC = () => {
  const stats = [
    {
      icon: Users,
      value: '10,000+',
      label: 'Active Users',
      description: 'Students and professionals trust Skillvento'
    },
    {
      icon: Award,
      value: '250,000+',
      label: 'Certificates Stored',
      description: 'Achievements safely organized and verified'
    },
    {
      icon: TrendingUp,
      value: '95%',
      label: 'Career Growth',
      description: 'Users report improved job prospects'
    },
    {
      icon: Globe,
      value: '150+',
      label: 'Countries',
      description: 'Global community of professionals'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Certificate Verification',
      description: 'Verify the authenticity of any certificate with our secure verification system',
      link: '/verify'
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get personalized career recommendations based on your skills and certificates',
      link: '/ai-career-mentor'
    },
    {
      icon: Users,
      title: 'Team Portfolios',
      description: 'Showcase team achievements and collaborate on professional growth',
      link: '/teams'
    }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Trusted by Professionals Worldwide
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Join a growing community of ambitious students and professionals who are taking control of their career journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4 group-hover:bg-white/30 transition-all duration-300">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                
                <div className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                
                <div className="text-blue-100 font-semibold mb-1">
                  {stat.label}
                </div>
                
                <div className="text-blue-200 text-sm">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Capabilities */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Powerful Features You'll Love
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-white/20 rounded-xl mb-6 group-hover:bg-white/30 transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 text-center">
                  {feature.title}
                </h3>
                
                <p className="text-blue-100 text-center mb-4">
                  {feature.description}
                </p>
                
                <div className="text-center">
                  <span className="inline-block text-white font-medium py-2 px-4 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300">
                    Explore Now →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Success Stories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Skillvento helped me organize my certifications and land my dream job at Google!",
                author: "Sarah Chen",
                role: "Software Engineer"
              },
              {
                quote: "The AI career mentor gave me insights I never would have discovered on my own.",
                author: "Marcus Rodriguez",
                role: "Data Scientist"
              },
              {
                quote: "Building my portfolio with Skillvento was so easy, and the results speak for themselves.",
                author: "Priya Patel",
                role: "Product Manager"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <p className="text-white mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">
                      {testimonial.author[0]}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {testimonial.author}
                    </div>
                    <div className="text-blue-200 text-xs">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Showcase Your Professional Journey?
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of professionals who are already using Skillvento to advance their careers.
          </p>
          <Link 
            to="/signup" 
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          >
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Stats;