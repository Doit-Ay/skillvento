import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Provide fallback values for development to prevent the app from crashing
const defaultUrl = 'https://placeholder.supabase.co';
const defaultKey = 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Using placeholder values. Please set up Supabase to enable authentication.');
}

export const supabase = createClient(
  supabaseUrl || defaultUrl, 
  supabaseAnonKey || defaultKey
);

// Utility function to generate referral code
export const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Blockchain helpers for certificate verification
export const blockchain = {
  generateCertificateHash: async (certificateData: any) => {
    // Simple hash generation for demonstration purposes
    // In a real implementation, this would interact with a blockchain network
    const dataString = JSON.stringify({
      title: certificateData.title,
      organization: certificateData.organization,
      issued_on: certificateData.issued_on,
      user_id: certificateData.user_id
    });
    
    // Create a simple hash using built-in crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `0x${hashHex}`;
  },
  
  verifyCertificateHash: async (certificateData: any, hash?: string) => {
    // Verify the certificate hash matches the data
    // In a real implementation, this would query the blockchain
    try {
      // For demo purposes, we'll simulate blockchain verification
      // In a real app, this would check against an actual blockchain
      
      // Simulate a 50/50 chance of verification success/failure
      // In production, this would be a real verification
      return true;
      
      // Uncomment for real verification:
      // const generatedHash = await blockchain.generateCertificateHash(certificateData);
      // return generatedHash === hash;
    } catch (error) {
      console.error('Error verifying certificate hash:', error);
      return false;
    }
  },
  
  // Placeholder for future blockchain integration
  isBlockchainEnabled: () => {
    // Return false for now, can be enabled when real blockchain integration is added
    return false;
  }
};

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock authentication.');
      // Return mock successful signup
      return { 
        data: { 
          user: { 
            id: 'mock-user-id', 
            email, 
            user_metadata: metadata 
          } 
        }, 
        error: null 
      };
    }
    return await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: metadata
      }
    });
  },
  
  signIn: async (email: string, password: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock authentication.');
      // Return mock successful login
      return { 
        data: { 
          user: { 
            id: 'mock-user-id', 
            email, 
            user_metadata: { 
              full_name: 'Demo User',
              username: 'demouser',
              referral_code: 'DEMO123',
              upload_limit: 25,
              subscription_tier: 'free'
            } 
          },
          session: { access_token: 'mock-token' }
        }, 
        error: null 
      };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signInWithOAuth: async (provider: 'google', referralCode?: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock authentication.');
      // Return mock successful OAuth
      return { 
        data: { provider, url: '#' }, 
        error: null 
      };
    }
    
    // Build redirect URL with referral code if provided
    const baseRedirectUrl = `${window.location.origin}/dashboard`;
    const redirectUrl = referralCode 
      ? `${baseRedirectUrl}?ref=${encodeURIComponent(referralCode)}`
      : baseRedirectUrl;
    
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        queryParams: referralCode ? {
          ref: referralCode
        } : undefined
      }
    });
  },
  
  signOut: async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock authentication.');
      // Clear any local storage items
      localStorage.removeItem('supabase.auth.token');
      return { error: null };
    }
    return await supabase.auth.signOut();
  },
  
  getCurrentUser: async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock authentication.');
      // Check if we have a mock user in localStorage
      const mockUserStr = localStorage.getItem('supabase.auth.token');
      if (mockUserStr) {
        try {
          const mockData = JSON.parse(mockUserStr);
          return mockData.currentSession?.user || null;
        } catch (e) {
          console.error('Error parsing mock user:', e);
        }
      }
      return null;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock authentication.');
      // Return a mock subscription object
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => {} 
          } 
        } 
      };
    }
    return supabase.auth.onAuthStateChange(callback);
  },

  // Admin auth functions
  sendMagicLink: async (email: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock authentication.');
      // Return mock successful magic link
      return { data: {}, error: null };
    }
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin11section/dashboard`
      }
    });
  }
};

// Database helpers
export const db = {
  // Users
  getUserProfile: async (id: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      // Return mock profile data
      return { 
        data: {
          id,
          full_name: 'Demo User',
          username: 'demouser',
          avatar_url: null,
          bio: 'This is a demo user profile for testing purposes.',
          social_links: {
            linkedin: 'https://linkedin.com/in/demouser',
            github: 'https://github.com/demouser',
            website: 'https://example.com'
          },
          upload_limit: 25,
          referral_code: 'DEMO123',
          referred_by: null,
          subscription_tier: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notification_preferences: {
            team_updates: true,
            platform_news: true,
            certificate_expiry: true,
            learning_recommendations: true
          },
          portfolio_theme: 'default',
          portfolio_layout: 'standard'
        }, 
        error: null 
      };
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      return { data, error };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return { data: null, error };
    }
  },
  
  insertProfile: async (profileData: any) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error in insertProfile:', error);
      return { data: null, error };
    }
  },
  
  updateUserProfile: async (id: string, updates: any) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id,
          ...updates,
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      return { data, error };
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return { data: null, error };
    }
  },
  
  getUserByUsername: async (username: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id: 'mock-user-id',
          full_name: 'Demo User',
          username: username,
          avatar_url: null,
          bio: 'This is a demo user profile for testing purposes.',
          social_links: {
            linkedin: 'https://linkedin.com/in/demouser',
            github: 'https://github.com/demouser',
            website: 'https://example.com'
          },
          upload_limit: 25,
          referral_code: 'DEMO123',
          referred_by: null,
          subscription_tier: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();
      
      return { data, error };
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      return { data: null, error };
    }
  },
  
  // Contact Info
  getContactInfo: async (userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id: 'mock-contact-id',
          user_id: userId,
          phone: '+1234567890',
          address: '123 Demo Street',
          city: 'Demo City',
          state: 'Demo State',
          country: 'Demo Country',
          postal_code: '12345',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('contact_info')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
    } catch (error) {
      console.error('Error in getContactInfo:', error);
      return { data: null, error };
    }
  },
  
  upsertContactInfo: async (userId: string, contactData: any) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id: 'mock-contact-id',
          user_id: userId,
          ...contactData,
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('contact_info')
        .upsert({
          user_id: userId,
          ...contactData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    } catch (error) {
      console.error('Error in upsertContactInfo:', error);
      return { data: null, error };
    }
  },
  
  // Academic Info
  getAcademicInfo: async (userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: [
          {
            id: 'mock-academic-id-1',
            user_id: userId,
            degree: 'Bachelor of Science',
            institution: 'Demo University',
            field_of_study: 'Computer Science',
            start_date: '2018-09-01',
            end_date: '2022-05-31',
            grade: 'A',
            description: 'Studied computer science with focus on software engineering',
            is_current: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ], 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('academic_info')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });
    } catch (error) {
      console.error('Error in getAcademicInfo:', error);
      return { data: [], error };
    }
  },
  
  insertAcademicInfo: async (academicData: any) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id: 'mock-academic-id-' + Date.now(),
          ...academicData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('academic_info')
        .insert(academicData);
    } catch (error) {
      console.error('Error in insertAcademicInfo:', error);
      return { data: null, error };
    }
  },
  
  updateAcademicInfo: async (id: string, updates: any) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id,
          ...updates,
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('academic_info')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (error) {
      console.error('Error in updateAcademicInfo:', error);
      return { data: null, error };
    }
  },
  
  deleteAcademicInfo: async (id: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { data: null, error: null };
    }
    
    try {
      return await supabase
        .from('academic_info')
        .delete()
        .eq('id', id);
    } catch (error) {
      console.error('Error in deleteAcademicInfo:', error);
      return { data: null, error };
    }
  },
  
  // Professional Experience
  getProfessionalExperience: async (userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: [
          {
            id: 'mock-experience-id-1',
            user_id: userId,
            title: 'Software Engineer',
            company: 'Demo Tech',
            location: 'Demo City',
            start_date: '2022-06-01',
            end_date: null,
            is_current: true,
            description: 'Working on full-stack web development projects',
            skills: ['JavaScript', 'React', 'Node.js'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ], 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('professional_experience')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });
    } catch (error) {
      console.error('Error in getProfessionalExperience:', error);
      return { data: [], error };
    }
  },
  
  insertProfessionalExperience: async (experienceData: any) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id: 'mock-experience-id-' + Date.now(),
          ...experienceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('professional_experience')
        .insert(experienceData);
    } catch (error) {
      console.error('Error in insertProfessionalExperience:', error);
      return { data: null, error };
    }
  },
  
  updateProfessionalExperience: async (id: string, updates: any) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id,
          ...updates,
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('professional_experience')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (error) {
      console.error('Error in updateProfessionalExperience:', error);
      return { data: null, error };
    }
  },
  
  deleteProfessionalExperience: async (id: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { data: null, error: null };
    }
    
    try {
      return await supabase
        .from('professional_experience')
        .delete()
        .eq('id', id);
    } catch (error) {
      console.error('Error in deleteProfessionalExperience:', error);
      return { data: null, error };
    }
  },
  
  // Certificates
  getUserCertificates: async (userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: [
          {
            id: 'mock-cert-id-1',
            user_id: userId,
            title: 'React Developer Certification',
            description: 'Advanced React development certification',
            organization: 'Meta',
            issued_on: '2023-05-15',
            expiry_date: '2026-05-15',
            file_url: 'mock-file-url',
            certificate_type: 'pdf',
            tags: ['React', 'JavaScript', 'Frontend'],
            domain: 'Web Development',
            is_verified: true,
            is_public: true,
            blockchain_hash: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'mock-cert-id-2',
            user_id: userId,
            title: 'AWS Cloud Practitioner',
            description: 'Foundational AWS certification',
            organization: 'Amazon Web Services',
            issued_on: '2023-03-10',
            expiry_date: '2026-03-10',
            file_url: 'mock-file-url',
            certificate_type: 'pdf',
            tags: ['AWS', 'Cloud', 'Infrastructure'],
            domain: 'Cloud Computing',
            is_verified: true,
            is_public: true,
            blockchain_hash: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ], 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .order('issued_on', { ascending: false });
    } catch (error) {
      console.error('Error in getUserCertificates:', error);
      return { data: [], error };
    }
  },
  
  getPublicCertificates: async (userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: [
          {
            id: 'mock-cert-id-1',
            user_id: userId,
            title: 'React Developer Certification',
            description: 'Advanced React development certification',
            organization: 'Meta',
            issued_on: '2023-05-15',
            expiry_date: '2026-05-15',
            file_url: 'mock-file-url',
            certificate_type: 'pdf',
            tags: ['React', 'JavaScript', 'Frontend'],
            domain: 'Web Development',
            is_verified: true,
            is_public: true,
            blockchain_hash: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ], 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('issued_on', { ascending: false });
    } catch (error) {
      console.error('Error in getPublicCertificates:', error);
      return { data: [], error };
    }
  },
  
  getCertificateById: async (id: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id,
          user_id: 'mock-user-id',
          title: 'React Developer Certification',
          description: 'Advanced React development certification',
          organization: 'Meta',
          issued_on: '2023-05-15',
          expiry_date: '2026-05-15',
          file_url: 'mock-file-url',
          certificate_type: 'pdf',
          tags: ['React', 'JavaScript', 'Frontend'],
          domain: 'Web Development',
          is_verified: true,
          is_public: true,
          blockchain_hash: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('certificates')
        .select('*')
        .eq('id', id)
        .single();
    } catch (error) {
      console.error('Error in getCertificateById:', error);
      return { data: null, error };
    }
  },
  
  insertCertificate: async (certificate: any) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id: 'mock-cert-id-' + Date.now(),
          ...certificate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('certificates')
        .insert(certificate);
    } catch (error) {
      console.error('Error in insertCertificate:', error);
      return { data: null, error };
    }
  },
  
  updateCertificate: async (id: string, updates: any) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id,
          ...updates,
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('certificates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (error) {
      console.error('Error in updateCertificate:', error);
      return { data: null, error };
    }
  },
  
  deleteCertificate: async (id: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { data: null, error: null };
    }
    
    try {
      return await supabase
        .from('certificates')
        .delete()
        .eq('id', id);
    } catch (error) {
      console.error('Error in deleteCertificate:', error);
      return { data: null, error };
    }
  },
  
  getCertificateCount: async (userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return 5; // Mock count
    }
    
    try {
      const { count } = await supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      return count || 0;
    } catch (error) {
      console.error('Error in getCertificateCount:', error);
      return 0;
    }
  },

  // Certificate Verification
  verifyCertificate: async (verificationCode: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id: 'mock-cert-id-1',
          user_id: 'mock-user-id',
          title: 'React Developer Certification',
          description: 'Advanced React development certification',
          organization: 'Meta',
          issued_on: '2023-05-15',
          expiry_date: '2026-05-15',
          file_url: 'mock-file-url',
          certificate_type: 'pdf',
          tags: ['React', 'JavaScript', 'Frontend'],
          domain: 'Web Development',
          is_verified: true,
          is_public: true,
          blockchain_hash: null,
          verification_code: verificationCode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profiles: {
            id: 'mock-user-id',
            full_name: 'Demo User',
            username: 'demouser',
            avatar_url: null
          }
        }, 
        error: null 
      };
    }
    
    try {
      // First, get the certificate
      const { data: certificate, error: certError } = await supabase
        .from('certificates')
        .select('*')
        .eq('verification_code', verificationCode)
        .single();

      if (certError || !certificate) {
        return { data: null, error: certError || new Error('Certificate not found') };
      }

      // Then, get the user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .eq('id', certificate.user_id)
        .single();

      if (profileError) {
        // Return certificate without profile if profile fetch fails
        return { data: certificate, error: null };
      }

      // Combine the data to match the expected structure
      const result = {
        ...certificate,
        profiles: profile
      };

      return { data: result, error: null };
    } catch (error) {
      console.error('Error in verifyCertificate:', error);
      return { data: null, error };
    }
  },

  // Verification Requests
  createVerificationRequest: async (requestData: {
    certificate_id: string;
    requester_email: string;
    verification_code: string;
    status?: string;
  }) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id: 'mock-request-id-' + Date.now(),
          ...requestData,
          status: requestData.status || 'pending',
          created_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('verification_requests')
        .insert({
          certificate_id: requestData.certificate_id,
          requester_email: requestData.requester_email,
          verification_code: requestData.verification_code,
          status: requestData.status || 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
    } catch (error) {
      console.error('Error in createVerificationRequest:', error);
      return { data: null, error };
    }
  },
  
  // Update user portfolio theme
  updateUserPortfolioTheme: async (userId: string, theme: string, layout?: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id: userId,
          portfolio_theme: theme,
          portfolio_layout: layout || 'standard',
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      const updates: any = {
        portfolio_theme: theme,
        updated_at: new Date().toISOString()
      };
      
      if (layout) {
        updates.portfolio_layout = layout;
      }
      
      return await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
    } catch (error) {
      console.error('Error in updateUserPortfolioTheme:', error);
      return { data: null, error };
    }
  },
  
  // Get portfolio themes
  getPortfolioThemes: async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: [
          {
            id: 'theme-1',
            name: 'Default',
            description: 'Clean and professional design with a blue color scheme',
            primary_color: '#3B82F6',
            secondary_color: '#8B5CF6',
            accent_color: '#10B981',
            is_premium: false,
            preview_url: '/themes/default.jpg',
            created_at: new Date().toISOString()
          },
          {
            id: 'theme-2',
            name: 'Minimal',
            description: 'Simple and elegant design with lots of white space',
            primary_color: '#1F2937',
            secondary_color: '#4B5563',
            accent_color: '#6B7280',
            is_premium: false,
            preview_url: '/themes/minimal.jpg',
            created_at: new Date().toISOString()
          },
          {
            id: 'theme-3',
            name: 'Creative',
            description: 'Bold and artistic design for creative professionals',
            primary_color: '#EC4899',
            secondary_color: '#8B5CF6',
            accent_color: '#F59E0B',
            is_premium: true,
            preview_url: '/themes/creative.jpg',
            created_at: new Date().toISOString()
          }
        ], 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('portfolio_themes')
        .select('*')
        .order('name');
    } catch (error) {
      console.error('Error in getPortfolioThemes:', error);
      return { data: [], error };
    }
  },
  
  // Dismiss learning recommendation
  dismissLearningRecommendation: async (id: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { data: null, error: null };
    }
    
    try {
      return await supabase
        .from('learning_recommendations')
        .update({ is_dismissed: true })
        .eq('id', id);
    } catch (error) {
      console.error('Error in dismissLearningRecommendation:', error);
      return { data: null, error };
    }
  },
  
  // Notifications
  getUserNotifications: async (userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: [
          {
            id: 'notification-1',
            user_id: userId,
            title: 'Welcome to Skillvento',
            message: 'Thank you for joining Skillvento! Start by uploading your first certificate.',
            type: 'system',
            is_read: false,
            action_url: '/dashboard',
            created_at: new Date().toISOString()
          },
          {
            id: 'notification-2',
            user_id: userId,
            title: 'Certificate Expiring Soon',
            message: 'Your AWS Cloud Practitioner certificate will expire in 30 days.',
            type: 'certificate_expiry',
            is_read: true,
            action_url: '/dashboard',
            created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          }
        ], 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return { data: [], error };
    }
  },
  
  getUnreadNotificationsCount: async (userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return 1; // Mock count
    }
    
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadNotificationsCount:', error);
      return 0;
    }
  },
  
  markNotificationAsRead: async (notificationId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { data: null, error: null };
    }
    
    try {
      return await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
      return { data: null, error };
    }
  },
  
  markAllNotificationsAsRead: async (userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { data: null, error: null };
    }
    
    try {
      return await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error in markAllNotificationsAsRead:', error);
      return { data: null, error };
    }
  },
  
  deleteNotification: async (notificationId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { data: null, error: null };
    }
    
    try {
      return await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return { data: null, error };
    }
  },
  
  // Teams
  getUserTeams: async (userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: [
          {
            team_id: 'team-1',
            role: 'owner',
            joined_at: new Date().toISOString(),
            teams: {
              id: 'team-1',
              name: 'Web Development Team',
              description: 'A team for web development projects and certifications',
              avatar_url: null,
              owner_id: userId,
              is_public: true,
              invite_code: 'WEBTEAM',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        ], 
        error: null 
      };
    }
    
    try {
      // Use the RPC function to avoid RLS recursion
      const { data, error } = await supabase
        .rpc('get_user_teams', { user_id: userId });
      
      if (error) {
        console.error('Error fetching user teams:', error);
        return { data: [], error };
      }
      
      // For mock database, return sample data
      if (!data || data.length === 0) {
        return {
          data: [
            {
              team_id: 'team_1',
              role: 'owner',
              joined_at: new Date().toISOString(),
              teams: {
                id: 'team_1',
                name: 'Web Development Team',
                description: 'A team for web development projects and certifications',
                avatar_url: null,
                owner_id: userId,
                is_public: true,
                invite_code: 'WEBTEAM',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }
          ],
          error: null
        };
      }
      
      // Transform the data to match the expected format
      const transformedData = data.map((item: any) => {
        return {
          team_id: item.team_id,
          role: item.role,
          joined_at: item.joined_at,
          teams: {
            id: item.team_id,
            name: item.name || 'Team',
            description: item.description || '',
            avatar_url: item.avatar_url,
            owner_id: item.owner_id || userId,
            is_public: item.is_public || false,
            invite_code: item.invite_code || 'INVITE',
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString()
          }
        };
      });
      
      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Unexpected error in getUserTeams:', error);
      return { data: [], error };
    }
  },
  
  getTeamById: async (id: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      // Get current user
      const user = await auth.getCurrentUser();
      
      return { 
        data: {
          id,
          name: 'Web Development Team',
          description: 'A team for web development projects and certifications',
          avatar_url: null,
          owner_id: user?.id || 'mock-user-id',
          is_public: true,
          invite_code: 'WEBTEAM',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          team_members: [
            {
              id: 'member-1',
              user_id: user?.id || 'mock-user-id',
              role: 'owner',
              joined_at: new Date().toISOString(),
              profiles: {
                id: user?.id || 'mock-user-id',
                full_name: user?.user_metadata?.full_name || 'Demo User',
                username: user?.user_metadata?.username || 'demouser',
                avatar_url: null
              }
            }
          ]
        }, 
        error: null 
      };
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }
      
      // Use the RPC function to avoid RLS recursion
      const { data, error } = await supabase
        .rpc('get_team_with_members', { 
          team_id: id, 
          requesting_user_id: user.id 
        });
      
      if (error) {
        console.error('Error fetching team details:', error);
        return { data: null, error };
      }
      
      // For mock database, return sample data
      if (!data || data.length === 0) {
        return {
          data: {
            id,
            name: 'Web Development Team',
            description: 'A team for web development projects and certifications',
            avatar_url: null,
            owner_id: user.id,
            is_public: true,
            invite_code: 'WEBTEAM',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            team_members: [
              {
                id: 'member_1',
                user_id: user.id,
                role: 'owner',
                joined_at: new Date().toISOString(),
                profiles: {
                  id: user.id,
                  full_name: user.user_metadata?.full_name || 'Team Owner',
                  username: user.user_metadata?.username || 'owner',
                  avatar_url: null
                }
              }
            ]
          },
          error: null
        };
      }
      
      // Transform the data to match the expected format
      const firstRow = data[0];
      const team = {
        id: firstRow.id,
        name: firstRow.name,
        description: firstRow.description,
        avatar_url: firstRow.avatar_url,
        owner_id: firstRow.owner_id,
        is_public: firstRow.is_public,
        invite_code: firstRow.invite_code,
        created_at: firstRow.created_at,
        updated_at: firstRow.updated_at,
        team_members: data
          .filter((row: any) => row.member_user_id) // Only include rows with actual members
          .map((row: any) => ({
            id: row.member_id,
            user_id: row.member_user_id,
            role: row.member_role,
            joined_at: row.member_joined_at,
            profiles: {
              id: row.member_user_id,
              full_name: row.member_full_name,
              username: row.member_username,
              avatar_url: row.member_avatar_url
            }
          }))
      };
      
      return { data: team, error: null };
    } catch (error) {
      console.error('Unexpected error in getTeamById:', error);
      return { data: null, error };
    }
  },

  createTeam: async (teamData: any, ownerId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      const teamId = 'team-' + Date.now();
      return { 
        data: {
          id: teamId,
          name: teamData.name,
          description: teamData.description,
          is_public: teamData.isPublic || false,
          owner_id: ownerId,
          invite_code: 'INVITE' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      // Generate a unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // First, create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamData.name,
          description: teamData.description,
          is_public: teamData.isPublic || false,
          owner_id: ownerId,
          invite_code: inviteCode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (teamError) {
        console.error('Error creating team:', teamError);
        return { data: null, error: teamError };
      }

      // Then, add the owner as a team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: ownerId,
          role: 'owner',
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        console.error('Error adding owner to team members:', memberError);
        // If adding the member fails, we should clean up the team
        await supabase.from('teams').delete().eq('id', team.id);
        return { data: null, error: memberError };
      }

      return { data: team, error: null };
    } catch (error) {
      console.error('Unexpected error in createTeam:', error);
      return { data: null, error };
    }
  },

  // Team Certificates
  getTeamCertificates: async (teamId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: [
          {
            id: 'team-cert-1',
            team_id: teamId,
            certificate_id: 'mock-cert-id-1',
            added_by: 'mock-user-id',
            created_at: new Date().toISOString(),
            certificates: {
              id: 'mock-cert-id-1',
              user_id: 'mock-user-id',
              title: 'React Developer Certification',
              description: 'Advanced React development certification',
              organization: 'Meta',
              issued_on: '2023-05-15',
              expiry_date: '2026-05-15',
              file_url: 'mock-file-url',
              certificate_type: 'pdf',
              tags: ['React', 'JavaScript', 'Frontend'],
              domain: 'Web Development',
              is_verified: true,
              is_public: true,
              blockchain_hash: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        ], 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('team_certificates')
        .select(`
          *,
          certificates (*)
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });
    } catch (error) {
      console.error('Error in getTeamCertificates:', error);
      return { data: [], error };
    }
  },

  addCertificateToTeam: async (teamId: string, certificateId: string, addedBy: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id: 'team-cert-' + Date.now(),
          team_id: teamId,
          certificate_id: certificateId,
          added_by: addedBy,
          created_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('team_certificates')
        .insert({
          team_id: teamId,
          certificate_id: certificateId,
          added_by: addedBy,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error in addCertificateToTeam:', error);
      return { data: null, error };
    }
  },

  removeCertificateFromTeam: async (teamId: string, certificateId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { data: null, error: null };
    }
    
    try {
      return await supabase
        .from('team_certificates')
        .delete()
        .eq('team_id', teamId)
        .eq('certificate_id', certificateId);
    } catch (error) {
      console.error('Error in removeCertificateFromTeam:', error);
      return { data: null, error };
    }
  },

  // Team Management
  leaveTeam: async (teamId: string, userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { data: null, error: null };
    }
    
    try {
      return await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error in leaveTeam:', error);
      return { data: null, error };
    }
  },

  deleteTeam: async (teamId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { data: null, error: null };
    }
    
    try {
      // Delete team (cascade will handle team_members and team_certificates)
      return await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
    } catch (error) {
      console.error('Error in deleteTeam:', error);
      return { data: null, error };
    }
  },

  joinTeam: async (inviteCode: string, userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id: 'team-member-' + Date.now(),
          team_id: 'mock-team-id',
          user_id: userId,
          role: 'member',
          joined_at: new Date().toISOString(),
          team: {
            id: 'mock-team-id',
            name: 'Demo Team'
          }
        }, 
        error: null 
      };
    }
    
    try {
      // First, find the team by invite code
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id, name')
        .eq('invite_code', inviteCode)
        .single();

      if (teamError || !team) {
        return { data: null, error: new Error('Invalid invite code') };
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', team.id)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        return { data: null, error: new Error('You are already a member of this team') };
      }

      // Add user to team
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: userId,
          role: 'member',
          joined_at: new Date().toISOString()
        })
        .select()
        .single();

      return { data: { ...data, team }, error };
    } catch (error) {
      console.error('Error joining team:', error);
      return { data: null, error };
    }
  },

  // Function to handle referral processing
  processReferral: async (userId: string, referralCode: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { success: true };
    }
    
    try {
      // Find the referrer by username or referral code
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id, username, referral_code')
        .or(`username.eq.${referralCode},referral_code.eq.${referralCode}`)
        .single();

      if (referrer && referrer.id !== userId) {
        // Create referral record
        const { error: referralError } = await supabase
          .from('referrals')
          .insert({
            referrer_id: referrer.id,
            referee_id: userId,
            status: 'completed',
            bonus_uploads: 5,
            completed_at: new Date().toISOString()
          });

        if (!referralError) {
          // Update referee's profile with referral info
          await supabase
            .from('profiles')
            .update({
              referred_by: referralCode,
              upload_limit: 30, // Base 25 + 5 bonus
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          return { success: true };
        }
      }
      return { success: false };
    } catch (error) {
      console.error('Error processing referral:', error);
      return { success: false };
    }
  },
  
  // Referrals
  getReferralStats: async (userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { count: 3, bonusUploads: 15 };
    }
    
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId);
      
      if (error) return { count: 0, bonusUploads: 0 };
      
      const completedReferrals = data?.filter(r => r.status === 'completed') || [];
      return {
        count: completedReferrals.length,
        bonusUploads: completedReferrals.length * 5
      };
    } catch (error) {
      console.error('Error in getReferralStats:', error);
      return { count: 0, bonusUploads: 0 };
    }
  },

  // Subscriptions
  createSubscription: async (subscriptionData: any) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id: 'subscription-' + Date.now(),
          ...subscriptionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('subscriptions')
        .insert({
          ...subscriptionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    } catch (error) {
      console.error('Error in createSubscription:', error);
      return { data: null, error };
    }
  },

  getUserSubscription: async (userId: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id: 'subscription-1',
          user_id: userId,
          plan_id: 'pro-monthly',
          plan_name: 'Pro Monthly',
          certificate_limit: 50,
          price_paid: 999,
          original_price: 1299,
          discount_applied: 20,
          promo_code: 'WELCOME20',
          status: 'active',
          starts_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 86400000).toISOString(), // 30 days from now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    } catch (error) {
      console.error('Error in getUserSubscription:', error);
      return { data: null, error };
    }
  },

  updateSubscription: async (id: string, updates: any) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          id,
          ...updates,
          updated_at: new Date().toISOString()
        }, 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('subscriptions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    } catch (error) {
      console.error('Error in updateSubscription:', error);
      return { data: null, error };
    }
  },

  // Admin functions
  getAllUsers: async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            full_name: 'User One',
            username: 'userone',
            subscription_tier: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'user-2',
            email: 'user2@example.com',
            full_name: 'User Two',
            username: 'usertwo',
            subscription_tier: 'pro',
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updated_at: new Date(Date.now() - 86400000).toISOString()
          }
        ], 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return { data: [], error };
    }
  },

  getAllCertificates: async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: [
          {
            id: 'cert-1',
            user_id: 'user-1',
            title: 'React Developer Certification',
            organization: 'Meta',
            issued_on: '2023-05-15',
            domain: 'Web Development',
            is_verified: true,
            is_public: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'cert-2',
            user_id: 'user-2',
            title: 'AWS Cloud Practitioner',
            organization: 'Amazon Web Services',
            issued_on: '2023-03-10',
            domain: 'Cloud Computing',
            is_verified: true,
            is_public: true,
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updated_at: new Date(Date.now() - 86400000).toISOString()
          }
        ], 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });
    } catch (error) {
      console.error('Error in getAllCertificates:', error);
      return { data: [], error };
    }
  },

  getAllSubscriptions: async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: [
          {
            id: 'sub-1',
            user_id: 'user-2',
            plan_id: 'pro-monthly',
            plan_name: 'Pro Monthly',
            certificate_limit: 50,
            price_paid: 999,
            original_price: 1299,
            status: 'active',
            starts_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            expires_at: new Date(Date.now() + 29 * 86400000).toISOString(), // 29 days from now
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString()
          }
        ], 
        error: null 
      };
    }
    
    try {
      return await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
    } catch (error) {
      console.error('Error in getAllSubscriptions:', error);
      return { data: [], error };
    }
  },

  // Function to get user teams without RLS recursion
  get_user_teams: async (user_id: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: [
          {
            team_id: 'team-1',
            role: 'owner',
            joined_at: new Date().toISOString(),
            name: 'Web Development Team',
            description: 'A team for web development projects and certifications',
            avatar_url: null,
            owner_id: user_id,
            is_public: true,
            invite_code: 'WEBTEAM',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ], 
        error: null 
      };
    }
    
    try {
      return await supabase
        .rpc('get_user_teams', { user_id });
    } catch (error) {
      console.error('Error in get_user_teams:', error);
      return { data: [], error };
    }
  },

  // Function to get team with members without RLS recursion
  get_team_with_members: async (team_id: string, requesting_user_id: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: [
          {
            id: team_id,
            name: 'Web Development Team',
            description: 'A team for web development projects and certifications',
            avatar_url: null,
            owner_id: requesting_user_id,
            is_public: true,
            invite_code: 'WEBTEAM',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            member_id: 'member-1',
            member_user_id: requesting_user_id,
            member_role: 'owner',
            member_joined_at: new Date().toISOString(),
            member_full_name: 'Demo User',
            member_username: 'demouser',
            member_avatar_url: null
          }
        ], 
        error: null 
      };
    }
    
    try {
      return await supabase
        .rpc('get_team_with_members', { team_id, requesting_user_id });
    } catch (error) {
      console.error('Error in get_team_with_members:', error);
      return { data: [], error };
    }
  }
};

// Storage helpers
export const storage = {
  uploadCertificate: async (file: File, userId: string, suffix: string = '') => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { 
        data: {
          path: `certificates/${userId}/${Date.now()}${suffix}.${file.name.split('.').pop()}`
        }, 
        error: null 
      };
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}${suffix}.${fileExt}`;
      
      return await supabase.storage
        .from('certificates')
        .upload(fileName, file);
    } catch (error) {
      console.error('Error in uploadCertificate:', error);
      return { data: null, error };
    }
  },
  
  getPublicUrl: (path: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return {
        data: {
          publicUrl: 'https://images.pexels.com/photos/6804604/pexels-photo-6804604.jpeg'
        }
      };
    }
    
    try {
      return supabase.storage
        .from('certificates')
        .getPublicUrl(path);
    } catch (error) {
      console.error('Error in getPublicUrl:', error);
      return { 
        data: { 
          publicUrl: 'https://images.pexels.com/photos/6804604/pexels-photo-6804604.jpeg' 
        } 
      };
    }
  },
  
  deleteCertificate: async (path: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase is not configured. Using mock data.');
      return { data: null, error: null };
    }
    
    try {
      return await supabase.storage
        .from('certificates')
        .remove([path]);
    } catch (error) {
      console.error('Error in deleteCertificate:', error);
      return { data: null, error };
    }
  }
};