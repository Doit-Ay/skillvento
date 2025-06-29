export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  social_links?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  upload_limit: number;
  referral_code: string;
  referred_by?: string;
  subscription_tier: 'free' | 'pro';
  created_at: string;
  updated_at: string;
  portfolio_theme?: string;
  portfolio_layout?: string;
  notification_preferences?: {
    certificate_expiry: boolean;
    learning_recommendations: boolean;
    team_updates: boolean;
    platform_news: boolean;
  };
}

export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  organization: string;
  issued_on: string;
  expiry_date?: string;
  file_url: string;
  thumbnail_url?: string;
  pdf_url?: string; // Always available PDF version
  image_url?: string; // Always available image version
  certificate_type: 'pdf' | 'image';
  tags: string[];
  domain: string;
  is_verified: boolean;
  is_public: boolean;
  blockchain_hash?: string;
  verification_code?: string;
  created_at: string;
  updated_at: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  verification_date?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  owner_id: string;
  is_public: boolean;
  invite_code: string;
  created_at: string;
  updated_at: string;
  members_count?: number;
  certificates_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user?: User;
}

export interface TeamCertificate {
  id: string;
  team_id: string;
  certificate_id: string;
  added_by: string;
  created_at: string;
  certificate?: Certificate;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  status: 'pending' | 'completed';
  bonus_uploads: number;
  created_at: string;
  completed_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  certificate_limit: number;
  price_paid: number;
  original_price: number;
  discount_applied: number;
  promo_code?: string;
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string;
  expires_at: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  preview_url: string;
  is_premium: boolean;
}

export interface SkillProgress {
  skill_category: string;
  count: number;
  latest_date: string;
  earliest_date: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'certificate_expiry' | 'learning_recommendation' | 'team_update' | 'system';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface PortfolioTheme {
  id: string;
  name: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  is_premium: boolean;
  preview_url: string;
}

export interface LearningRecommendation {
  id: string;
  user_id: string;
  title: string;
  description: string;
  provider: string;
  url: string;
  domain: string;
  confidence_score: number;
  is_dismissed: boolean;
  created_at: string;
}

export interface VerificationRequest {
  id: string;
  certificate_id: string;
  requester_email: string;
  verification_code: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  verified_at?: string;
}