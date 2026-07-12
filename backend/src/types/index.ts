import { Request } from 'express';
import { Session, User } from '@supabase/supabase-js';

// ─── Auth Types ──────────────────────────────────

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role?: string;
  created_at?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  session?: Session;
}

export type OtpType = 'sms' | 'email' | 'phone_change' | 'email_change' | 'signup';

export interface SignUpPayload {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role?: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface PhoneSignInPayload {
  phone: string;
  password?: string;
}

export interface VerifyOtpPayload {
  token: string;
  type: OtpType;
  phone?: string;
  email?: string;
}

export interface ResendOtpPayload {
  type: 'sms' | 'email';
  phone?: string;
  email?: string;
}

export interface ResetPasswordPayload {
  access_token: string;
  new_password: string;
}

// ─── User Profile Types ─────────────────────────

export interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_login: string;
}

export interface CreateProfilePayload {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
}

// ─── API Response Types ─────────────────────────

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}
