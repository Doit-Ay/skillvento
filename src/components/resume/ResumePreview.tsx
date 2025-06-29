import React from 'react';
import { Mail, Phone, Linkedin, Github, Calendar, Building, MapPin, Globe } from 'lucide-react';
import { Certificate } from '../../types';
import { format } from 'date-fns';

interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    website: string;
    location: string;
    summary: string;
  };
  skills: string[];
  selectedCertificates: string[];
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
  }>;
  template: string;
  customization?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: number;
    spacing: number;
  };
}

interface ResumePreviewProps {
  resumeData: ResumeData;
  certificates: Certificate[];
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, certificates }) => {
  const { personalInfo, skills, experience, education, customization } = resumeData;

  // Default customization values
  const primaryColor = customization?.primaryColor || '#3B82F6';
  const secondaryColor = customization?.secondaryColor || '#8B5CF6';
  const fontFamily = customization?.fontFamily || 'Inter';
  const fontSize = customization?.fontSize || 14;
  const spacing = customization?.spacing || 1;

  const renderModernTemplate = () => (
    <div 
      className="bg-white" 
      style={{ 
        fontFamily, 
        fontSize: `${fontSize}px`,
        lineHeight: `${spacing * 1.5}`,
        width: '210mm',
        minHeight: '297mm',
        maxWidth: '100%',
        overflow: 'hidden',
        margin: '0 auto'
      }}
    >
      {/* Header */}
      <div style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }} className="text-white p-8">
        <h1 className="text-4xl font-bold mb-2">
          {personalInfo.name || 'Your Name'}
        </h1>
        <p className="text-xl text-white/90 mb-4">
          {personalInfo.title || 'Professional Title'}
        </p>
        
        <div className="flex flex-wrap gap-4 text-sm text-white/80">
          {personalInfo.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              {personalInfo.email}
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              {personalInfo.phone}
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {personalInfo.location}
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center">
              <Linkedin className="h-4 w-4 mr-1" />
              {personalInfo.linkedin}
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center">
              <Github className="h-4 w-4 mr-1" />
              {personalInfo.github}
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-1" />
              {personalInfo.website}
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 pb-1" style={{ borderColor: primaryColor }}>
              Professional Summary
            </h2>
            <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: personalInfo.summary }}></div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 pb-1" style={{ borderColor: primaryColor }}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 pb-1" style={{ borderColor: primaryColor }}>
              Experience
            </h2>
            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{exp.title}</h3>
                      <p style={{ color: primaryColor }} className="font-medium">{exp.company}</p>
                      {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certificates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 pb-1" style={{ borderColor: primaryColor }}>
              Certifications
            </h2>
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{cert.title}</h3>
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      {cert.organization}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {cert.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600 ml-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(cert.issued_on), 'MMM yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 pb-1" style={{ borderColor: primaryColor }}>
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                    <p style={{ color: primaryColor }} className="text-sm">{edu.school}</p>
                    {edu.location && <p className="text-gray-600 text-sm">{edu.location}</p>}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {edu.graduationDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderClassicTemplate = () => (
    <div 
      className="bg-white p-8" 
      style={{ 
        fontFamily, 
        fontSize: `${fontSize}px`,
        lineHeight: `${spacing * 1.5}`,
        width: '210mm',
        minHeight: '297mm',
        maxWidth: '100%',
        overflow: 'hidden',
        margin: '0 auto'
      }}
    >
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {personalInfo.name || 'Your Name'}
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {personalInfo.title || 'Professional Title'}
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          {personalInfo.email && (
            <span className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {personalInfo.location}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
            Professional Summary
          </h2>
          <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: personalInfo.summary }}></div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
            Skills
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="text-gray-700 text-sm">
                • {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
            Experience
          </h2>
          <div className="space-y-6">
            {experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{exp.title}</h3>
                    <p className="text-gray-700">{exp.company}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </div>
                </div>
                {exp.description && (
                  <div className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certificates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
            Certifications
          </h2>
          <div className="space-y-2">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-900">{cert.title}</span>
                  <span className="text-gray-600 text-sm ml-2">- {cert.organization}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {format(new Date(cert.issued_on), 'MMM yyyy')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-900">{edu.degree}</span>
                  <span className="text-gray-600 text-sm ml-2">- {edu.school}</span>
                </div>
                <span className="text-sm text-gray-600">{edu.graduationDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMinimalTemplate = () => (
    <div 
      className="bg-white p-8" 
      style={{ 
        fontFamily, 
        fontSize: `${fontSize}px`,
        lineHeight: `${spacing * 1.5}`,
        width: '210mm',
        minHeight: '297mm',
        maxWidth: '100%',
        overflow: 'hidden',
        margin: '0 auto'
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {personalInfo.name || 'Your Name'}
        </h1>
        <p className="text-lg mb-4" style={{ color: primaryColor }}>
          {personalInfo.title || 'Professional Title'}
        </p>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo.email && (
            <span className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {personalInfo.location}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center">
              <Linkedin className="h-4 w-4 mr-1" />
              {personalInfo.linkedin}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Summary */}
          {personalInfo.summary && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>
                About
              </h2>
              <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: personalInfo.summary }}></div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>
                Experience
              </h2>
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{exp.title}</h3>
                        <p className="text-gray-700">{exp.company}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </div>
                    </div>
                    {exp.description && (
                      <div className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-700">{edu.school}</p>
                      {edu.location && <p className="text-gray-600 text-sm">{edu.location}</p>}
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      {edu.graduationDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>
                Skills
              </h2>
              <div className="space-y-2">
                {skills.map((skill, index) => (
                  <div key={index} className="text-gray-700">
                    • {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certificates.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>
                Certifications
              </h2>
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div key={cert.id}>
                    <div className="font-medium text-gray-900">{cert.title}</div>
                    <div className="text-gray-600 text-sm">{cert.organization}</div>
                    <div className="text-gray-500 text-xs">
                      {format(new Date(cert.issued_on), 'MMM yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTechTemplate = () => (
    <div 
      className="bg-white" 
      style={{ 
        fontFamily, 
        fontSize: `${fontSize}px`,
        lineHeight: `${spacing * 1.5}`,
        width: '210mm',
        minHeight: '297mm',
        maxWidth: '100%',
        overflow: 'hidden',
        margin: '0 auto'
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Sidebar */}
        <div className="p-8" style={{ backgroundColor: primaryColor, color: 'white' }}>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">
              {personalInfo.name || 'Your Name'}
            </h1>
            <p className="text-white/80 mb-4">
              {personalInfo.title || 'Professional Title'}
            </p>
          </div>

          <div className="space-y-6">
            {/* Contact */}
            <div>
              <h2 className="text-lg font-bold mb-3 border-b border-white/20 pb-1">
                Contact
              </h2>
              <div className="space-y-2">
                {personalInfo.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center text-sm">
                    <Linkedin className="h-4 w-4 mr-2" />
                    <span>{personalInfo.linkedin}</span>
                  </div>
                )}
                {personalInfo.github && (
                  <div className="flex items-center text-sm">
                    <Github className="h-4 w-4 mr-2" />
                    <span>{personalInfo.github}</span>
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-2" />
                    <span>{personalInfo.website}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3 border-b border-white/20 pb-1">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded text-xs font-medium bg-white/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3 border-b border-white/20 pb-1">
                  Education
                </h2>
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <div key={index}>
                      <h3 className="font-medium">{edu.degree}</h3>
                      <p className="text-white/80 text-sm">{edu.school}</p>
                      <p className="text-white/60 text-xs">{edu.graduationDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certificates.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3 border-b border-white/20 pb-1">
                  Certifications
                </h2>
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div key={cert.id}>
                      <h3 className="font-medium">{cert.title}</h3>
                      <p className="text-white/80 text-sm">{cert.organization}</p>
                      <p className="text-white/60 text-xs">
                        {format(new Date(cert.issued_on), 'MMM yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 md:col-span-2">
          {/* Summary */}
          {personalInfo.summary && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3 pb-1 border-b-2" style={{ borderColor: primaryColor }}>
                About Me
              </h2>
              <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: personalInfo.summary }}></div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3 pb-1 border-b-2" style={{ borderColor: primaryColor }}>
                Experience
              </h2>
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{exp.title}</h3>
                        <p style={{ color: primaryColor }} className="font-medium">{exp.company}</p>
                        {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
                      </div>
                      <div className="text-right text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </div>
                    </div>
                    {exp.description && (
                      <div className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCreativeTemplate = () => (
    <div 
      className="bg-white" 
      style={{ 
        fontFamily, 
        fontSize: `${fontSize}px`,
        lineHeight: `${spacing * 1.5}`,
        width: '210mm',
        minHeight: '297mm',
        maxWidth: '100%',
        overflow: 'hidden',
        margin: '0 auto'
      }}
    >
      {/* Header with accent */}
      <div className="relative">
        <div className="absolute top-0 right-0 w-1/3 h-full" style={{ backgroundColor: `${primaryColor}20` }}></div>
        <div className="relative p-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>
            {personalInfo.name || 'Your Name'}
          </h1>
          <p className="text-xl text-gray-700 mb-4">
            {personalInfo.title || 'Professional Title'}
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 max-w-2xl">
            {personalInfo.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1" style={{ color: primaryColor }} />
                {personalInfo.email}
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" style={{ color: primaryColor }} />
                {personalInfo.phone}
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" style={{ color: primaryColor }} />
                {personalInfo.location}
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center">
                <Linkedin className="h-4 w-4 mr-1" style={{ color: primaryColor }} />
                {personalInfo.linkedin}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
        <div className="md:col-span-2">
          {/* Summary */}
          {personalInfo.summary && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3" style={{ color: primaryColor }}>
                About Me
              </h2>
              <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: personalInfo.summary }}></div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3" style={{ color: primaryColor }}>
                Experience
              </h2>
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="relative pl-6 border-l-2" style={{ borderColor: `${primaryColor}40` }}>
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                    <div className="mb-2">
                      <h3 className="font-bold text-gray-900">{exp.title}</h3>
                      <div className="flex justify-between">
                        <p className="font-medium" style={{ color: primaryColor }}>{exp.company}</p>
                        <p className="text-sm text-gray-600">
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </p>
                      </div>
                      {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
                    </div>
                    {exp.description && (
                      <div className="text-gray-700 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3" style={{ color: primaryColor }}>
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="relative pl-6 border-l-2" style={{ borderColor: `${primaryColor}40` }}>
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                      <p className="font-medium" style={{ color: primaryColor }}>{edu.school}</p>
                      <div className="flex justify-between">
                        {edu.location && <p className="text-gray-600 text-sm">{edu.location}</p>}
                        <p className="text-sm text-gray-600">{edu.graduationDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: `${primaryColor}10` }}>
              <h2 className="text-xl font-bold mb-3" style={{ color: primaryColor }}>
                Skills
              </h2>
              <div className="space-y-2">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: primaryColor }}></div>
                    <span className="text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certificates.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3" style={{ color: primaryColor }}>
                Certifications
              </h2>
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div key={cert.id} className="p-3 border rounded-lg" style={{ borderColor: `${primaryColor}30` }}>
                    <h3 className="font-medium text-gray-900">{cert.title}</h3>
                    <p className="text-gray-600 text-sm">{cert.organization}</p>
                    <p className="text-gray-500 text-xs">
                      {format(new Date(cert.issued_on), 'MMM yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderExecutiveTemplate = () => (
    <div 
      className="bg-white" 
      style={{ 
        fontFamily, 
        fontSize: `${fontSize}px`,
        lineHeight: `${spacing * 1.5}`,
        width: '210mm',
        minHeight: '297mm',
        maxWidth: '100%',
        overflow: 'hidden',
        margin: '0 auto'
      }}
    >
      {/* Header */}
      <div className="p-8 border-b-4" style={{ borderColor: primaryColor }}>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {personalInfo.name || 'Your Name'}
            </h1>
            <p className="text-xl mb-4" style={{ color: primaryColor }}>
              {personalInfo.title || 'Professional Title'}
            </p>
          </div>
          <div className="text-right">
            {personalInfo.email && (
              <div className="text-gray-700 mb-1">{personalInfo.email}</div>
            )}
            {personalInfo.phone && (
              <div className="text-gray-700 mb-1">{personalInfo.phone}</div>
            )}
            {personalInfo.location && (
              <div className="text-gray-700">{personalInfo.location}</div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase">
              Executive Summary
            </h2>
            <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: personalInfo.summary }}></div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase">
              Professional Experience
            </h2>
            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{exp.title}</h3>
                      <p className="font-medium" style={{ color: primaryColor }}>{exp.company}</p>
                      {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
                    </div>
                    <div className="text-right text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="text-gray-700 text-sm leading-relaxed mt-2" dangerouslySetInnerHTML={{ __html: exp.description }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Education */}
          {education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase">
                Education
              </h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                    <p className="font-medium" style={{ color: primaryColor }}>{edu.school}</p>
                    <div className="flex justify-between">
                      {edu.location && <p className="text-gray-600 text-sm">{edu.location}</p>}
                      <p className="text-sm text-gray-600">{edu.graduationDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certificates.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase">
                Certifications
              </h2>
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div key={cert.id}>
                    <div className="font-medium text-gray-900">{cert.title}</div>
                    <div className="text-gray-600 text-sm">{cert.organization}</div>
                    <div className="text-gray-500 text-xs">
                      {format(new Date(cert.issued_on), 'MMM yyyy')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase">
              Core Competencies
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded text-sm font-medium"
                  style={{ 
                    backgroundColor: `${primaryColor}10`, 
                    color: 'black',
                    border: `1px solid ${primaryColor}30`
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTemplate = () => {
    switch (resumeData.template) {
      case 'classic':
        return renderClassicTemplate();
      case 'minimal':
        return renderMinimalTemplate();
      case 'tech':
        return renderTechTemplate();
      case 'creative':
        return renderCreativeTemplate();
      case 'executive':
        return renderExecutiveTemplate();
      case 'modern':
      default:
        return renderModernTemplate();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Resume Preview</h3>
      </div>
      
      <div className="overflow-auto max-h-[800px]">
        {renderTemplate()}
      </div>
    </div>
  );
};

export default ResumePreview;