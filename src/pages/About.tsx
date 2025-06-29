import React from 'react';
import { Award, Users, Target, Heart, Linkedin, Twitter, Github, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const About: React.FC = () => {
  const team = [
    {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      bio: 'Former Google engineer passionate about helping students showcase their achievements.',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      name: 'Sarah Chen',
      role: 'Head of Product',
      bio: 'Design thinking expert focused on creating intuitive user experiences.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Lead Developer',
      bio: 'Full-stack developer with expertise in AI and blockchain technologies.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      social: {
        linkedin: '#',
        twitter: '#',
        github: '#'
      }
    }
  ];

  const values = [
    {
      icon: Award,
      title: 'Excellence',
      description: 'We believe every achievement deserves recognition and proper showcase.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a supportive network where professionals can grow together.'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology to solve real career challenges.'
    },
    {
      icon: Heart,
      title: 'Empowerment',
      description: 'Giving everyone the tools to tell their professional story effectively.'
    }
  ];

  const features = [
    { name: 'Certificate Vault', link: '/certificate-vault' },
    { name: 'AI Resume Builder', link: '/resume' },
    { name: 'Team Collaboration', link: '/teams' },
    { name: 'Skill Analytics', link: '/analytics' },
    { name: 'Blockchain Verification', link: '/blockchain-verification' },
    { name: 'AI Career Mentor', link: '/ai-career-mentor' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Skillvento</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to revolutionize how students and professionals showcase their achievements, 
              build their careers, and connect with opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Skillvento was born from a simple observation: talented students and professionals 
                  were struggling to effectively showcase their achievements and skills to potential employers.
                </p>
                <p>
                  Traditional resumes couldn't capture the full scope of modern learning journeys - 
                  from online certifications to hackathon victories, from personal projects to collaborative achievements.
                </p>
                <p>
                  We set out to create a platform that would not only organize and verify these achievements 
                  but also use AI to help users understand their career trajectory and make informed decisions 
                  about their professional growth.
                </p>
                <p>
                  Today, Skillvento serves thousands of users worldwide, helping them build compelling 
                  portfolios that open doors to new opportunities.
                </p>
              </div>
              
              <div className="mt-8">
                <Link to="/features">
                  <Button 
                    variant="outline" 
                    icon={ArrowRight} 
                    iconPosition="right"
                  >
                    Explore Our Features
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Team collaboration"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">10,000+</div>
                    <div className="text-gray-600">Happy Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Capabilities */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Key Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore the tools that make Skillvento the leading platform for professional growth
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((feature, index) => (
              <Link 
                key={index}
                to={feature.link}
                className="bg-white rounded-xl p-4 text-center border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <span className="text-gray-900 font-medium">{feature.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Skillvento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate individuals working to make career growth accessible to everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 mb-4">{member.bio}</p>
                <div className="flex justify-center space-x-3">
                  <a href={member.social.linkedin} className="text-gray-400 hover:text-blue-600 transition-colors duration-200">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href={member.social.twitter} className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href={member.social.github} className="text-gray-400 hover:text-gray-900 transition-colors duration-200">
                    <Github className="h-5 w-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
          <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-8">
            To democratize career growth by providing every student and professional with the tools, 
            insights, and community they need to showcase their achievements, understand their potential, 
            and accelerate their career journey.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">250K+</div>
              <div className="text-blue-100">Certificates Organized</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-blue-100">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">150+</div>
              <div className="text-blue-100">Countries Served</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Get In Touch</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Have questions, feedback, or want to join our team? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@skillvento.com"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Contact Us
            </a>
            <Link to="/features">
              <Button variant="outline">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;