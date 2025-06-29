import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Wand2, 
  Save, 
  Settings, 
  Plus, 
  Trash2, 
  Sparkles, 
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  User as UserIcon,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Palette,
  Type,
  Layout
} from 'lucide-react';
import { auth, db } from '../lib/supabase';
import type { User, Certificate } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ResumePreview from '../components/resume/ResumePreview';
import AdvancedTemplateSelector from '../components/resume/AdvancedTemplateSelector';
import LiveEditor from '../components/resume/LiveEditor';
import ColorPicker from '../components/resume/ColorPicker';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

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
  customization: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: number;
    spacing: number;
  };
}

interface ATSScore {
  overall: number;
  breakdown: {
    keywords: number;
    formatting: number;
    sections: number;
    length: number;
  };
  suggestions: string[];
  missingKeywords: string[];
}

const ResumeBuilder: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '',
      title: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      website: '',
      location: '',
      summary: ''
    },
    skills: [],
    selectedCertificates: [],
    experience: [],
    education: [],
    template: 'modern',
    customization: {
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      fontFamily: 'Inter',
      fontSize: 14,
      spacing: 1
    }
  });
  const [jobDescription, setJobDescription] = useState('');
  const [atsScore, setATSScore] = useState<ATSScore>({
    overall: 0,
    breakdown: { keywords: 0, formatting: 0, sections: 0, length: 0 },
    suggestions: [],
    missingKeywords: []
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'experience' | 'education' | 'certificates' | 'template' | 'customize' | 'ats'>('info');

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    calculateATSScore();
  }, [resumeData, jobDescription]);

  const loadUserData = async () => {
    try {
      const currentUser = await auth.getCurrentUser();
      if (currentUser) {
        const { data: profile } = await db.getUserProfile(currentUser.id);
        setUser(profile);

        const { data: certs } = await db.getUserCertificates(currentUser.id);
        setCertificates(certs || []);

        // Pre-fill form with user data
        setResumeData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            name: profile?.full_name || '',
            email: currentUser.email || '',
            linkedin: profile?.social_links?.linkedin || '',
            github: profile?.social_links?.github || '',
            website: profile?.social_links?.website || '',
            summary: profile?.bio || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateATSScore = () => {
    const { personalInfo, skills, experience, education } = resumeData;
    
    // Extract keywords from job description
    const jdKeywords = extractKeywords(jobDescription);
    const resumeText = `${personalInfo.summary} ${skills.join(' ')} ${experience.map(exp => exp.description).join(' ')}`.toLowerCase();
    
    // Calculate keyword match
    const matchedKeywords = jdKeywords.filter(keyword => 
      resumeText.includes(keyword.toLowerCase())
    );
    const keywordScore = jdKeywords.length > 0 ? (matchedKeywords.length / jdKeywords.length) * 100 : 80;
    
    // Calculate formatting score
    const formattingScore = calculateFormattingScore();
    
    // Calculate sections score
    const sectionsScore = calculateSectionsScore();
    
    // Calculate length score
    const lengthScore = calculateLengthScore();
    
    // Overall score
    const overall = Math.round((keywordScore + formattingScore + sectionsScore + lengthScore) / 4);
    
    // Generate suggestions
    const suggestions = generateSuggestions(overall, keywordScore, formattingScore, sectionsScore, lengthScore);
    
    // Missing keywords
    const missingKeywords = jdKeywords.filter(keyword => 
      !resumeText.includes(keyword.toLowerCase())
    ).slice(0, 10);

    setATSScore({
      overall,
      breakdown: {
        keywords: Math.round(keywordScore),
        formatting: Math.round(formattingScore),
        sections: Math.round(sectionsScore),
        length: Math.round(lengthScore)
      },
      suggestions,
      missingKeywords
    });
  };

  const extractKeywords = (text: string): string[] => {
    if (!text) return [];
    
    // Common technical and professional keywords
    const commonKeywords = [
      'javascript', 'python', 'react', 'node.js', 'sql', 'aws', 'docker', 'kubernetes',
      'agile', 'scrum', 'leadership', 'management', 'communication', 'teamwork',
      'problem solving', 'analytical', 'creative', 'strategic', 'innovative'
    ];
    
    // Extract words from job description
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'she', 'use', 'her', 'now', 'air', 'day', 'men', 'get', 'use', 'man', 'new', 'now', 'old', 'see', 'him', 'two', 'how', 'its', 'who', 'oil', 'sit', 'set'].includes(word));
    
    // Combine and deduplicate
    return [...new Set([...commonKeywords, ...words])].slice(0, 20);
  };

  const calculateFormattingScore = (): number => {
    let score = 100;
    
    // Check for consistent formatting
    if (resumeData.template === 'creative') score -= 10; // ATS prefers simple layouts
    if (resumeData.personalInfo.name.length === 0) score -= 20;
    if (resumeData.personalInfo.email.length === 0) score -= 15;
    if (resumeData.personalInfo.phone.length === 0) score -= 10;
    
    return Math.max(score, 0);
  };

  const calculateSectionsScore = (): number => {
    let score = 0;
    
    if (resumeData.personalInfo.name) score += 20;
    if (resumeData.personalInfo.summary) score += 20;
    if (resumeData.skills.length > 0) score += 20;
    if (resumeData.experience.length > 0) score += 20;
    if (resumeData.education.length > 0) score += 10;
    if (resumeData.selectedCertificates.length > 0) score += 10;
    
    return Math.min(score, 100);
  };

  const calculateLengthScore = (): number => {
    const totalWords = [
      resumeData.personalInfo.summary,
      ...resumeData.experience.map(exp => exp.description),
      ...resumeData.education.map(edu => edu.degree)
    ].join(' ').split(' ').length;
    
    if (totalWords < 200) return 60;
    if (totalWords > 800) return 70;
    return 100; // Sweet spot: 200-800 words
  };

  const generateSuggestions = (overall: number, keywords: number, formatting: number, sections: number, length: number): string[] => {
    const suggestions: string[] = [];
    
    if (overall < 60) {
      suggestions.push('Your resume needs significant improvement to pass ATS screening');
    }
    
    if (keywords < 70) {
      suggestions.push('Add more relevant keywords from the job description');
      suggestions.push('Include industry-specific terminology and skills');
    }
    
    if (formatting < 80) {
      suggestions.push('Use a simpler, ATS-friendly template');
      suggestions.push('Ensure all contact information is complete');
    }
    
    if (sections < 80) {
      suggestions.push('Add missing resume sections (summary, skills, experience)');
      suggestions.push('Include relevant certifications and education');
    }
    
    if (length < 80) {
      suggestions.push('Expand your experience descriptions with specific achievements');
      suggestions.push('Add quantifiable results and metrics to your accomplishments');
    }
    
    if (resumeData.personalInfo.summary.length < 50) {
      suggestions.push('Write a more comprehensive professional summary (50+ words)');
    }
    
    if (resumeData.skills.length < 5) {
      suggestions.push('Add more relevant technical and soft skills');
    }
    
    return suggestions.slice(0, 5);
  };

  const optimizeForJob = async () => {
    if (!jobDescription) {
      alert('Please paste a job description first');
      return;
    }

    setGenerating(true);
    try {
      // Simulate AI optimization
      await new Promise(resolve => setTimeout(resolve, 3000));

      const jdKeywords = extractKeywords(jobDescription);
      const relevantSkills = jdKeywords.filter(keyword => 
        ['javascript', 'python', 'react', 'node.js', 'sql', 'aws', 'docker', 'kubernetes', 'agile', 'scrum'].includes(keyword.toLowerCase())
      );

      // Update skills with relevant keywords
      const newSkills = [...new Set([...resumeData.skills, ...relevantSkills])];
      
      // Generate optimized summary
      const optimizedSummary = `Results-driven ${resumeData.personalInfo.title || 'professional'} with expertise in ${relevantSkills.slice(0, 3).join(', ')}. Proven track record of delivering high-quality solutions and driving business growth through innovative approaches and strong technical skills.`;

      setResumeData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          summary: optimizedSummary
        },
        skills: newSkills.slice(0, 15)
      }));

    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateAISummary = async () => {
    setGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const domains = [...new Set(certificates.map(cert => cert.domain))];
      const topSkills = certificates.flatMap(cert => cert.tags).slice(0, 5);
      
      const summary = `Dynamic ${resumeData.personalInfo.title || 'professional'} with expertise in ${domains.slice(0, 3).join(', ')}. Demonstrated commitment to continuous learning through ${certificates.length} professional certifications. Proven track record in ${topSkills.slice(0, 3).join(', ')} with hands-on experience in modern technologies and best practices. Passionate about leveraging cutting-edge solutions to drive innovation and deliver exceptional results.`;
      
      setResumeData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          summary
        }
      }));
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateSkills = () => {
    const skillsFromCerts = certificates.flatMap(cert => cert.tags);
    const skillCounts = skillsFromCerts.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([skill]) => skill);
    
    setResumeData(prev => ({
      ...prev,
      skills: topSkills
    }));
  };

  const downloadResume = async (format: 'pdf' | 'docx' | 'txt') => {
    setDownloading(true);
    try {
      const resumeElement = document.getElementById('resume-preview');
      if (!resumeElement) {
        throw new Error('Resume preview not found');
      }

      const fileName = `${resumeData.personalInfo.name || 'Resume'}_Resume`;

      if (format === 'pdf') {
        await downloadAsPDF(resumeElement, fileName);
      } else if (format === 'txt') {
        await downloadAsText(fileName);
      } else if (format === 'docx') {
        await downloadAsDocx(fileName);
      }
      
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const downloadAsPDF = async (element: HTMLElement, fileName: string) => {
    // Create high-quality canvas
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(`${fileName}.pdf`);
  };

  const downloadAsText = async (fileName: string) => {
    const { personalInfo, skills, experience, education } = resumeData;
    const selectedCerts = certificates.filter(cert => 
      resumeData.selectedCertificates.includes(cert.id)
    );

    let textContent = '';
    
    // Header
    textContent += `${personalInfo.name}\n`;
    textContent += `${personalInfo.title}\n`;
    textContent += `${personalInfo.email} | ${personalInfo.phone}\n`;
    if (personalInfo.location) textContent += `${personalInfo.location}\n`;
    if (personalInfo.linkedin) textContent += `LinkedIn: ${personalInfo.linkedin}\n`;
    if (personalInfo.github) textContent += `GitHub: ${personalInfo.github}\n`;
    textContent += '\n';

    // Summary
    if (personalInfo.summary) {
      textContent += 'PROFESSIONAL SUMMARY\n';
      textContent += `${personalInfo.summary.replace(/<[^>]*>/g, '')}\n\n`;
    }

    // Skills
    if (skills.length > 0) {
      textContent += 'SKILLS\n';
      textContent += `${skills.join(', ')}\n\n`;
    }

    // Experience
    if (experience.length > 0) {
      textContent += 'EXPERIENCE\n';
      experience.forEach(exp => {
        textContent += `${exp.title} - ${exp.company}\n`;
        textContent += `${exp.startDate} - ${exp.endDate || 'Present'}\n`;
        if (exp.location) textContent += `${exp.location}\n`;
        if (exp.description) textContent += `${exp.description.replace(/<[^>]*>/g, '')}\n`;
        textContent += '\n';
      });
    }

    // Certifications
    if (selectedCerts.length > 0) {
      textContent += 'CERTIFICATIONS\n';
      selectedCerts.forEach(cert => {
        textContent += `${cert.title} - ${cert.organization}\n`;
        textContent += `Issued: ${new Date(cert.issued_on).toLocaleDateString()}\n\n`;
      });
    }

    // Education
    if (education.length > 0) {
      textContent += 'EDUCATION\n';
      education.forEach(edu => {
        textContent += `${edu.degree} - ${edu.school}\n`;
        textContent += `${edu.graduationDate}\n`;
        if (edu.location) textContent += `${edu.location}\n`;
        textContent += '\n';
      });
    }

    // Create and download file
    const blob = new Blob([textContent], { type: 'text/plain' });
    saveAs(blob, `${fileName}.txt`);
  };

  const downloadAsDocx = async (fileName: string) => {
    const { personalInfo, skills, experience, education } = resumeData;
    const selectedCerts = certificates.filter(cert => 
      resumeData.selectedCertificates.includes(cert.id)
    );

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Header
            new Paragraph({
              text: personalInfo.name || 'Your Name',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: personalInfo.title || 'Professional Title',
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `${personalInfo.email || ''} | ${personalInfo.phone || ''}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: personalInfo.location || '',
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),

            // Summary
            ...(personalInfo.summary ? [
              new Paragraph({
                text: 'PROFESSIONAL SUMMARY',
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                text: personalInfo.summary.replace(/<[^>]*>/g, ''),
              }),
              new Paragraph({ text: '' }),
            ] : []),

            // Skills
            ...(skills.length > 0 ? [
              new Paragraph({
                text: 'SKILLS',
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                text: skills.join(', '),
              }),
              new Paragraph({ text: '' }),
            ] : []),

            // Experience
            ...(experience.length > 0 ? [
              new Paragraph({
                text: 'EXPERIENCE',
                heading: HeadingLevel.HEADING_2,
              }),
              ...experience.flatMap(exp => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.title,
                      bold: true,
                    }),
                    new TextRun({ text: ' - ' }),
                    new TextRun({
                      text: exp.company,
                    }),
                  ],
                }),
                new Paragraph({
                  text: `${exp.startDate} - ${exp.endDate || 'Present'}`,
                }),
                ...(exp.location ? [
                  new Paragraph({
                    text: exp.location,
                  }),
                ] : []),
                ...(exp.description ? [
                  new Paragraph({
                    text: exp.description.replace(/<[^>]*>/g, ''),
                  }),
                ] : []),
                new Paragraph({ text: '' }),
              ]),
            ] : []),

            // Certifications
            ...(selectedCerts.length > 0 ? [
              new Paragraph({
                text: 'CERTIFICATIONS',
                heading: HeadingLevel.HEADING_2,
              }),
              ...selectedCerts.flatMap(cert => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cert.title,
                      bold: true,
                    }),
                    new TextRun({ text: ' - ' }),
                    new TextRun({
                      text: cert.organization,
                    }),
                  ],
                }),
                new Paragraph({
                  text: `Issued: ${new Date(cert.issued_on).toLocaleDateString()}`,
                }),
                new Paragraph({ text: '' }),
              ]),
            ] : []),

            // Education
            ...(education.length > 0 ? [
              new Paragraph({
                text: 'EDUCATION',
                heading: HeadingLevel.HEADING_2,
              }),
              ...education.flatMap(edu => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.degree,
                      bold: true,
                    }),
                    new TextRun({ text: ' - ' }),
                    new TextRun({
                      text: edu.school,
                    }),
                  ],
                }),
                new Paragraph({
                  text: edu.graduationDate,
                }),
                ...(edu.location ? [
                  new Paragraph({
                    text: edu.location,
                  }),
                ] : []),
                new Paragraph({ text: '' }),
              ]),
            ] : []),
          ],
        },
      ],
    });

    // Generate and save document using browser-compatible method
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleSkillsChange = (skills: string[]) => {
    setResumeData(prev => ({
      ...prev,
      skills
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        description: ''
      }]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        school: '',
        location: '',
        graduationDate: ''
      }]
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleCertificateToggle = (certId: string) => {
    setResumeData(prev => ({
      ...prev,
      selectedCertificates: prev.selectedCertificates.includes(certId)
        ? prev.selectedCertificates.filter(id => id !== certId)
        : [...prev.selectedCertificates, certId]
    }));
  };

  const selectAllCertificates = () => {
    setResumeData(prev => ({
      ...prev,
      selectedCertificates: certificates.map(cert => cert.id)
    }));
  };

  const handleTemplateChange = (template: string) => {
    setResumeData(prev => ({
      ...prev,
      template
    }));
  };

  const handleCustomizationChange = (field: string, value: string | number) => {
    setResumeData(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [field]: value
      }
    }));
  };

  const getATSScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getATSScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Sparkles className="h-8 w-8 mr-3 text-blue-600" />
            AI Resume Builder
          </h1>
          <p className="text-gray-600">
            Create ATS-optimized resumes with AI-powered content generation and real-time scoring
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-2 px-6 overflow-x-auto">
                  {[
                    { id: 'info', label: 'Personal', icon: UserIcon },
                    { id: 'skills', label: 'Skills', icon: Zap },
                    { id: 'experience', label: 'Experience', icon: Briefcase },
                    { id: 'education', label: 'Education', icon: GraduationCap },
                    { id: 'certificates', label: 'Certificates', icon: Award },
                    { id: 'template', label: 'Template', icon: Layout },
                    { id: 'customize', label: 'Customize', icon: Palette },
                    { id: 'ats', label: 'ATS Score', icon: Target }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6 max-h-[500px] overflow-y-auto">
                {/* Personal Info Tab */}
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        value={resumeData.personalInfo.name}
                        onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                        fullWidth
                      />
                      <Input
                        label="Professional Title"
                        value={resumeData.personalInfo.title}
                        onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
                        placeholder="e.g., Full Stack Developer"
                        fullWidth
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                        fullWidth
                      />
                      <Input
                        label="Phone"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                        fullWidth
                      />
                      <Input
                        label="Location"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                        placeholder="City, State"
                        fullWidth
                      />
                      <Input
                        label="LinkedIn"
                        value={resumeData.personalInfo.linkedin}
                        onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                        placeholder="linkedin.com/in/username"
                        fullWidth
                      />
                      <Input
                        label="GitHub"
                        value={resumeData.personalInfo.github}
                        onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                        placeholder="github.com/username"
                        fullWidth
                      />
                      <Input
                        label="Website"
                        value={resumeData.personalInfo.website}
                        onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                        placeholder="yourwebsite.com"
                        fullWidth
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Professional Summary
                        </label>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Wand2}
                          onClick={generateAISummary}
                          loading={generating}
                        >
                          ✨ AI Generate
                        </Button>
                      </div>
                      <LiveEditor
                        content={resumeData.personalInfo.summary}
                        onChange={(content) => handlePersonalInfoChange('summary', content)}
                        placeholder="Write a brief summary of your professional background..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Skills</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Wand2}
                        onClick={generateSkills}
                      >
                        ✨ Auto-generate
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm flex items-center justify-between"
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => handleSkillsChange(resumeData.skills.filter((_, i) => i !== index))}
                            className="text-blue-500 hover:text-blue-700 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <Input
                      placeholder="Add a skill and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value && !resumeData.skills.includes(value)) {
                            handleSkillsChange([...resumeData.skills, value]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      fullWidth
                    />
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
                      <Button size="sm" icon={Plus} onClick={addExperience}>
                        Add Experience
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {resumeData.experience.map((exp, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
                            <button
                              onClick={() => removeExperience(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Job Title"
                              value={exp.title}
                              onChange={(e) => updateExperience(index, 'title', e.target.value)}
                              fullWidth
                            />
                            <Input
                              label="Company"
                              value={exp.company}
                              onChange={(e) => updateExperience(index, 'company', e.target.value)}
                              fullWidth
                            />
                            <Input
                              label="Location"
                              value={exp.location}
                              onChange={(e) => updateExperience(index, 'location', e.target.value)}
                              fullWidth
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                label="Start Date"
                                type="month"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                fullWidth
                              />
                              <Input
                                label="End Date"
                                type="month"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                placeholder="Present"
                                fullWidth
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <LiveEditor
                              content={exp.description}
                              onChange={(content) => updateExperience(index, 'description', content)}
                              placeholder="Describe your responsibilities and achievements..."
                              className="min-h-[80px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Education</h3>
                      <Button size="sm" icon={Plus} onClick={addEducation}>
                        Add Education
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {resumeData.education.map((edu, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                            <button
                              onClick={() => removeEducation(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Degree"
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              placeholder="e.g., Bachelor of Science in Computer Science"
                              fullWidth
                            />
                            <Input
                              label="School"
                              value={edu.school}
                              onChange={(e) => updateEducation(index, 'school', e.target.value)}
                              fullWidth
                            />
                            <Input
                              label="Location"
                              value={edu.location}
                              onChange={(e) => updateEducation(index, 'location', e.target.value)}
                              fullWidth
                            />
                            <Input
                              label="Graduation Date"
                              type="month"
                              value={edu.graduationDate}
                              onChange={(e) => updateEducation(index, 'graduationDate', e.target.value)}
                              fullWidth
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certificates Tab */}
                {activeTab === 'certificates' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Select Certificates to Include</h3>
                      <Button size="sm" variant="outline" onClick={selectAllCertificates}>
                        Select All
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={resumeData.selectedCertificates.includes(cert.id)}
                            onChange={() => handleCertificateToggle(cert.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{cert.title}</h4>
                            <p className="text-sm text-gray-600">{cert.organization} • {cert.domain}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Template Tab */}
                {activeTab === 'template' && (
                  <AdvancedTemplateSelector
                    selectedTemplate={resumeData.template}
                    onTemplateChange={handleTemplateChange}
                  />
                )}

                {/* Customize Tab */}
                {activeTab === 'customize' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Customize Appearance</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ColorPicker
                        label="Primary Color"
                        color={resumeData.customization.primaryColor}
                        onChange={(color) => handleCustomizationChange('primaryColor', color)}
                      />
                      
                      <ColorPicker
                        label="Secondary Color"
                        color={resumeData.customization.secondaryColor}
                        onChange={(color) => handleCustomizationChange('secondaryColor', color)}
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Font Family
                        </label>
                        <select
                          value={resumeData.customization.fontFamily}
                          onChange={(e) => handleCustomizationChange('fontFamily', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Inter">Inter (Modern)</option>
                          <option value="Arial">Arial (Classic)</option>
                          <option value="Times New Roman">Times New Roman (Traditional)</option>
                          <option value="Calibri">Calibri (Professional)</option>
                          <option value="Georgia">Georgia (Elegant)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Font Size: {resumeData.customization.fontSize}px
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="18"
                          value={resumeData.customization.fontSize}
                          onChange={(e) => handleCustomizationChange('fontSize', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Spacing: {resumeData.customization.spacing}x
                        </label>
                        <input
                          type="range"
                          min="0.8"
                          max="1.5"
                          step="0.1"
                          value={resumeData.customization.spacing}
                          onChange={(e) => handleCustomizationChange('spacing', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ATS Score Tab */}
                {activeTab === 'ats' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">ATS Optimization Score</h3>
                      <div className={`text-6xl font-bold ${getATSScoreColor(atsScore.overall)} mb-2`}>
                        {atsScore.overall}%
                      </div>
                      <p className="text-gray-600">
                        {atsScore.overall >= 80 ? 'Excellent! Your resume is ATS-optimized' :
                         atsScore.overall >= 60 ? 'Good, but could use some improvements' :
                         'Needs significant improvement for ATS compatibility'}
                      </p>
                    </div>

                    {/* Job Description Input */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Job Description (Optional)
                        </label>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Target}
                          onClick={optimizeForJob}
                          loading={generating}
                          disabled={!jobDescription}
                        >
                          ✨ Optimize for Job
                        </Button>
                      </div>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here to get personalized optimization suggestions..."
                        rows={4}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(atsScore.breakdown).map(([key, score]) => (
                        <div key={key} className={`p-4 rounded-lg ${getATSScoreBg(score)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {key === 'keywords' ? 'Keywords' : 
                               key === 'formatting' ? 'Formatting' :
                               key === 'sections' ? 'Sections' : 'Length'}
                            </span>
                            <span className={`text-lg font-bold ${getATSScoreColor(score)}`}>
                              {score}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                score >= 80 ? 'bg-green-500' :
                                score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Suggestions */}
                    {atsScore.suggestions.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Improvement Suggestions
                        </h4>
                        <ul className="space-y-1">
                          {atsScore.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-yellow-800">
                              • {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missing Keywords */}
                    {atsScore.missingKeywords.length > 0 && jobDescription && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Missing Keywords from Job Description
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {atsScore.missingKeywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm cursor-pointer hover:bg-blue-200"
                              onClick={() => {
                                if (!resumeData.skills.includes(keyword)) {
                                  handleSkillsChange([...resumeData.skills, keyword]);
                                }
                              }}
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                          Click on keywords to add them to your skills section
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button icon={Save} variant="outline" fullWidth>
                  Save Draft
                </Button>
                <div className="relative group">
                  <Button 
                    icon={Download} 
                    onClick={() => downloadResume('pdf')} 
                    loading={downloading}
                    fullWidth
                  >
                    {downloading ? 'Generating...' : 'Download PDF'}
                  </Button>
                  <div className="absolute left-0 right-0 -bottom-20 hidden group-hover:block">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-1">
                      <button 
                        onClick={() => downloadResume('pdf')}
                        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Download as PDF
                      </button>
                      <button 
                        onClick={() => downloadResume('docx')}
                        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Download as DOCX
                      </button>
                      <button 
                        onClick={() => downloadResume('txt')}
                        className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Download as TXT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getATSScoreBg(atsScore.overall)} ${getATSScoreColor(atsScore.overall)}`}>
                  ATS Score: {atsScore.overall}%
                </div>
              </div>
              <div id="resume-preview" className="overflow-auto max-h-[800px]">
                <ResumePreview
                  resumeData={resumeData}
                  certificates={certificates.filter(cert => 
                    resumeData.selectedCertificates.includes(cert.id)
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;