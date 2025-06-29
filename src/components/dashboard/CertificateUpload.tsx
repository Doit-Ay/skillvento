import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Calendar, Building, Tag, FileText, Image as ImageIcon, Plus, Wand2, Sparkles, Shield } from 'lucide-react';
import { auth, db, storage, blockchain } from '../../lib/supabase';
import Button from '../common/Button';
import Input from '../common/Input';
import { Certificate } from '../../types';
import VerificationQRCode from '../verification/VerificationQRCode';

interface CertificateUploadProps {
  onClose: () => void;
  onSuccess: () => void;
  domains: string[];
  editingCertificate?: Certificate | null;
}

const CertificateUpload: React.FC<CertificateUploadProps> = ({
  onClose,
  onSuccess,
  domains,
  editingCertificate
}) => {
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    issued_on: '',
    expiry_date: '',
    domain: '',
    customDomain: '',
    tags: '',
    description: '',
    is_public: true,
    is_verified: false,
    verification_code: '',
    blockchain_verify: false
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState('');
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [showVerificationOptions, setShowVerificationOptions] = useState(false);
  const [showVerificationQR, setShowVerificationQR] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (editingCertificate) {
      const isCustomDomain = !domains.includes(editingCertificate.domain);
      setFormData({
        title: editingCertificate.title,
        organization: editingCertificate.organization,
        issued_on: editingCertificate.issued_on,
        expiry_date: editingCertificate.expiry_date || '',
        domain: isCustomDomain ? 'custom' : editingCertificate.domain,
        customDomain: isCustomDomain ? editingCertificate.domain : '',
        tags: editingCertificate.tags.join(', '),
        description: editingCertificate.description || '',
        is_public: editingCertificate.is_public,
        is_verified: editingCertificate.is_verified,
        verification_code: editingCertificate.verification_code || '',
        blockchain_verify: !!editingCertificate.blockchain_hash
      });
      setShowCustomDomain(isCustomDomain);
      setShowVerificationOptions(!!editingCertificate.verification_code || !!editingCertificate.blockchain_hash);
      
      // Set preview for existing certificate
      if (editingCertificate.image_url) {
        const { data: imageUrl } = storage.getPublicUrl(editingCertificate.image_url);
        setPreview(imageUrl.publicUrl);
      } else if (editingCertificate.certificate_type === 'image') {
        const { data: fileUrl } = storage.getPublicUrl(editingCertificate.file_url);
        setPreview(fileUrl.publicUrl);
      }
    }
  }, [editingCertificate, domains]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        setFile(selectedFile);
        
        // Create preview for images
        if (selectedFile.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => setPreview(reader.result as string);
          reader.readAsDataURL(selectedFile);
        } else {
          // For PDFs, show a placeholder preview
          setPreview('pdf-placeholder');
        }
      }
    }
  });

  // AI Analysis function (simulated)
  const analyzeAndFillDetails = async () => {
    if (!file) {
      setError('Please upload a certificate first');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulated AI analysis results based on file name and common patterns
      const fileName = file.name.toLowerCase();
      let analyzedData = {
        title: '',
        organization: '',
        domain: '',
        tags: '',
        expiry_date: ''
      };

      // Simple pattern matching for demonstration
      if (fileName.includes('react') || fileName.includes('javascript')) {
        analyzedData = {
          title: 'React Developer Certification',
          organization: 'Meta',
          domain: 'Web Development',
          tags: 'React, JavaScript, Frontend, Web Development',
          expiry_date: ''
        };
      } else if (fileName.includes('python') || fileName.includes('data')) {
        analyzedData = {
          title: 'Python Data Science Certificate',
          organization: 'Google',
          domain: 'Data Science',
          tags: 'Python, Data Science, Machine Learning, Analytics',
          expiry_date: ''
        };
      } else if (fileName.includes('aws') || fileName.includes('cloud')) {
        analyzedData = {
          title: 'AWS Cloud Practitioner',
          organization: 'Amazon Web Services',
          domain: 'Cloud Computing',
          tags: 'AWS, Cloud Computing, Infrastructure, DevOps',
          expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0]
        };
      } else if (fileName.includes('design') || fileName.includes('ui')) {
        analyzedData = {
          title: 'UI/UX Design Certificate',
          organization: 'Adobe',
          domain: 'UI/UX Design',
          tags: 'UI Design, UX Design, Figma, Adobe XD',
          expiry_date: ''
        };
      } else {
        // Generic analysis
        analyzedData = {
          title: 'Professional Certificate',
          organization: 'Certification Authority',
          domain: 'Professional Development',
          tags: 'Professional, Skills, Development',
          expiry_date: ''
        };
      }

      // Update form with analyzed data
      setFormData(prev => ({
        ...prev,
        title: analyzedData.title,
        organization: analyzedData.organization,
        domain: analyzedData.domain,
        tags: analyzedData.tags,
        expiry_date: analyzedData.expiry_date,
        issued_on: new Date().toISOString().split('T')[0] // Today's date as default
      }));

    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze certificate. Please fill details manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Convert PDF to image using PDF.js
  const convertPDFToImage = async (pdfFile: File): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Check if PDF.js is available
        if (typeof window.pdfjsLib === 'undefined') {
          throw new Error('PDF.js library not loaded');
        }

        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        
        // Set scale for good quality
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page to canvas
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/jpeg', 0.9);
        
      } catch (error) {
        reject(error);
      }
    });
  };

  // Convert image to PDF using jsPDF
  const convertImageToPDF = async (imageFile: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined') {
          throw new Error('jsPDF library not loaded');
        }

        const { jsPDF } = window.jspdf;
        const img = document.createElement('img');
        
        img.onload = () => {
          try {
            // Determine orientation based on image dimensions
            const orientation = img.naturalWidth > img.naturalHeight ? 'l' : 'p';
            const pdf = new jsPDF(orientation, 'px', [img.naturalWidth, img.naturalHeight]);
            
            // Add image to PDF
            pdf.addImage(img, 'JPEG', 0, 0, img.naturalWidth, img.naturalHeight);
            
            // Get PDF as blob
            const pdfBlob = pdf.output('blob');
            
            // Clean up object URL
            URL.revokeObjectURL(img.src);
            resolve(pdfBlob);
          } catch (error) {
            URL.revokeObjectURL(img.src);
            reject(error);
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(img.src);
          reject(new Error('Failed to load image'));
        };
        
        img.src = URL.createObjectURL(imageFile);
        
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDomainChange = (value: string) => {
    setFormData(prev => ({ ...prev, domain: value }));
    setShowCustomDomain(value === 'custom');
    if (value !== 'custom') {
      setFormData(prev => ({ ...prev, customDomain: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCertificate && !file) {
      setError('Please select a file to upload');
      return;
    }

    // Validate custom domain
    if (formData.domain === 'custom' && !formData.customDomain.trim()) {
      setError('Please enter a custom domain name');
      return;
    }

    setLoading(true);
    setError('');
    setConverting(true);

    try {
      const user = await auth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      let originalFileUrl = editingCertificate?.file_url;
      let pdfFileUrl = editingCertificate?.pdf_url;
      let imageFileUrl = editingCertificate?.image_url;
      let certificateType = editingCertificate?.certificate_type;
      let blockchainHash = editingCertificate?.blockchain_hash;

      // Process new file if provided
      if (file) {
        const isImage = file.type.startsWith('image/');
        const isPDF = file.type === 'application/pdf';
        
        if (isImage) {
          setConversionProgress('Uploading original image...');
          
          // Upload original image
          const { data: imageUpload, error: imageError } = await storage.uploadCertificate(file, user.id, '_original');
          if (imageError) throw imageError;
          
          setConversionProgress('Converting image to PDF...');
          
          // Convert image to PDF
          const pdfBlob = await convertImageToPDF(file);
          const pdfFile = new File([pdfBlob], `${file.name.replace(/\.(jpg|jpeg|png)$/i, '')}.pdf`, {
            type: 'application/pdf'
          });
          
          const { data: pdfUpload, error: pdfError } = await storage.uploadCertificate(pdfFile, user.id, '_converted_pdf');
          if (pdfError) throw pdfError;
          
          originalFileUrl = imageUpload.path;
          imageFileUrl = imageUpload.path;
          pdfFileUrl = pdfUpload.path;
          certificateType = 'image';
          
        } else if (isPDF) {
          setConversionProgress('Uploading original PDF...');
          
          // Upload original PDF
          const { data: pdfUpload, error: pdfError } = await storage.uploadCertificate(file, user.id, '_original');
          if (pdfError) throw pdfError;
          
          setConversionProgress('Converting PDF to image...');
          
          // Convert PDF to image
          const imageBlob = await convertPDFToImage(file);
          const imageFile = new File([imageBlob], `${file.name.replace('.pdf', '')}.jpg`, {
            type: 'image/jpeg'
          });
          
          const { data: imageUpload, error: imageError } = await storage.uploadCertificate(imageFile, user.id, '_converted_image');
          if (imageError) throw imageError;
          
          originalFileUrl = pdfUpload.path;
          pdfFileUrl = pdfUpload.path;
          imageFileUrl = imageUpload.path;
          certificateType = 'pdf';
        }
        
        setConversionProgress('Saving certificate...');
      }

      // Generate verification code if needed
      let verificationCode = formData.verification_code;
      if (formData.is_verified && !verificationCode) {
        verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      }
      
      // Generate blockchain hash if requested
      if (formData.blockchain_verify && !blockchainHash) {
        setConversionProgress('Generating blockchain verification...');
        
        // Create a temporary certificate object for hashing
        const tempCertificate: Certificate = {
          id: editingCertificate?.id || Math.random().toString(36).substring(2, 15),
          user_id: user.id,
          title: formData.title,
          organization: formData.organization,
          issued_on: formData.issued_on,
          file_url: originalFileUrl!,
          certificate_type: certificateType!,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          domain: formData.domain === 'custom' ? formData.customDomain.trim() : formData.domain,
          is_verified: formData.is_verified,
          is_public: formData.is_public,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        blockchainHash = await blockchain.generateCertificateHash(tempCertificate);
      }

      // Determine final domain value
      const finalDomain = formData.domain === 'custom' ? formData.customDomain.trim() : formData.domain;

      const certificateData = {
        user_id: user.id,
        title: formData.title,
        organization: formData.organization,
        issued_on: formData.issued_on,
        expiry_date: formData.expiry_date || null,
        domain: finalDomain,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        file_url: originalFileUrl!,
        pdf_url: pdfFileUrl,
        image_url: imageFileUrl,
        certificate_type: certificateType!,
        is_public: formData.is_public,
        is_verified: formData.is_verified,
        verification_code: verificationCode,
        blockchain_hash: formData.blockchain_verify ? blockchainHash : null
      };

      if (editingCertificate) {
        // Update existing certificate
        const { error: dbError } = await db.updateCertificate(editingCertificate.id, certificateData);
        if (dbError) throw dbError;
      } else {
        // Create new certificate
        const { error: dbError } = await db.insertCertificate(certificateData);
        if (dbError) throw dbError;

        // If it's a new custom domain, add it to the domains list for future use
        if (formData.domain === 'custom' && formData.customDomain.trim()) {
          // This would be handled by the parent component to update the domains list
          // For now, we'll just save the certificate with the custom domain
        }
      }

      // If verification was enabled, show the QR code
      if (formData.is_verified && verificationCode) {
        setShowVerificationQR(true);
        return; // Don't close the modal yet
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || `Failed to ${editingCertificate ? 'update' : 'upload'} certificate`);
    } finally {
      setLoading(false);
      setConverting(false);
      setConversionProgress('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {editingCertificate ? 'Edit Certificate' : 'Upload Certificate'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {showVerificationQR ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Certificate Saved Successfully!</h3>
              <p className="text-gray-600">
                Your certificate has been saved and is now verifiable. Share this QR code or verification code with anyone who needs to verify this certificate.
              </p>
            </div>
            
            <VerificationQRCode 
              verificationCode={formData.verification_code} 
              certificateId={editingCertificate?.id || ''}
            />
            
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
              <Button onClick={onSuccess}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {converting && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  {conversionProgress || 'Processing file...'}
                </div>
              </div>
            )}

            {analyzing && (
              <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  AI is analyzing your certificate...
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Certificate File {!editingCertificate && <span className="text-red-500">*</span>}
                </label>
                {file && !editingCertificate && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    icon={Wand2}
                    onClick={analyzeAndFillDetails}
                    loading={analyzing}
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 text-xs"
                  >
                    ✨ AI Fill Details
                  </Button>
                )}
              </div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-colors duration-200 ${
                  isDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : file || preview
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                {file || preview ? (
                  <div className="space-y-2">
                    {preview && preview !== 'pdf-placeholder' ? (
                      <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded" />
                    ) : (
                      <div className="flex items-center justify-center">
                        <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-green-500" />
                      </div>
                    )}
                    <p className="text-sm font-medium text-green-700">
                      {file ? file.name : 'Current file'}
                    </p>
                    <p className="text-xs text-green-600">
                      Click or drag to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto" />
                    <p className="text-sm font-medium text-gray-700">
                      {isDragActive ? 'Drop the file here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                    <p className="text-xs text-blue-600">
                      ✨ We'll automatically convert and store both PDF and image versions
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Certificate Title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., React Developer Certification"
                icon={FileText}
                required
                fullWidth
              />

              <Input
                label="Issuing Organization"
                type="text"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                placeholder="e.g., Meta, Google, Coursera"
                icon={Building}
                required
                fullWidth
              />

              <Input
                label="Date of Issue"
                type="date"
                value={formData.issued_on}
                onChange={(e) => handleInputChange('issued_on', e.target.value)}
                icon={Calendar}
                required
                fullWidth
              />
              
              <Input
                label="Expiry Date (Optional)"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                icon={Calendar}
                fullWidth
                helperText="Leave blank if certificate doesn't expire"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Domain <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.domain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a domain</option>
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                  <option value="custom">+ Add Custom Domain</option>
                </select>
              </div>
              
              <Input
                label="Tags (for search purposes)"
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="e.g., javascript, frontend, react (comma-separated)"
                icon={Tag}
                helperText="These tags help in searching certificates but won't be displayed publicly"
                fullWidth
              />
            </div>

            {/* Custom Domain Input */}
            {showCustomDomain && (
              <Input
                label="Custom Domain Name"
                type="text"
                value={formData.customDomain}
                onChange={(e) => handleInputChange('customDomain', e.target.value)}
                placeholder="e.g., Artificial Intelligence, Quantum Computing"
                icon={Plus}
                required
                fullWidth
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the certificate..."
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Verification Options */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">Certificate Verification</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVerificationOptions(!showVerificationOptions)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showVerificationOptions ? 'Hide Options' : 'Show Options'}
                </button>
              </div>
              
              {showVerificationOptions && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center">
                    <input
                      id="is_verified"
                      type="checkbox"
                      checked={formData.is_verified}
                      onChange={(e) => handleInputChange('is_verified', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_verified" className="ml-2 text-sm text-gray-700">
                      Enable certificate verification
                    </label>
                  </div>
                  
                  {formData.is_verified && (
                    <div className="pl-6">
                      <p className="text-xs text-gray-500 mb-2">
                        A unique verification code will be generated for this certificate. 
                        Anyone with this code can verify the authenticity of this certificate.
                      </p>
                      
                      {formData.verification_code && (
                        <div className="flex items-center bg-gray-100 rounded p-2 mb-2">
                          <span className="text-xs font-mono text-gray-700">{formData.verification_code}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center mt-3">
                        <input
                          id="blockchain_verify"
                          type="checkbox"
                          checked={formData.blockchain_verify}
                          onChange={(e) => handleInputChange('blockchain_verify', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="blockchain_verify" className="ml-2 text-sm text-gray-700">
                          Add blockchain verification (enhanced security)
                        </label>
                      </div>
                      
                      {formData.blockchain_verify && (
                        <p className="text-xs text-gray-500 mt-1 pl-6">
                          This will create a tamper-proof record of your certificate on the blockchain
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center space-x-3">
              <input
                id="is_public"
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => handleInputChange('is_public', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_public" className="text-sm font-medium text-gray-700">
                Make this certificate public on my portfolio
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading || converting}
                disabled={converting}
                fullWidth
              >
                {editingCertificate ? 'Update Certificate' : 'Upload Certificate'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CertificateUpload;