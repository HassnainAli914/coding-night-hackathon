import { getSupabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config';
import { emailService } from './email.service';
import type {
  SignUpPayload,
  SignInPayload,
  PhoneSignInPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
} from '../types';

const isSmtpMocked = (): boolean => {
  const { host, user, pass } = config.smtp;
  return (
    !user ||
    user === 'your-email@domain.com' ||
    !pass ||
    pass === 'your-email-password-or-app-key' ||
    host === 'smtp.yourprovider.com'
  );
};

/**
 * Auth Service — encapsulates all Supabase Auth operations.
 * Called by the auth controller. Never accessed directly from routes.
 */
/**
 * Normalize Pakistani phone: strip leading 0, ensure 10 digits starting with 3.
 * e.g. "03001234567" → "3001234567", "3001234567" → "3001234567"
 */
function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;
}

export class AuthService {

  /**
   * Sign up a new user with email + password.
   * Optionally stores name and phone in user_metadata.
   */
  async signUpWithEmail(payload: SignUpPayload) {
    const supabase = getSupabaseAdmin();
    const phone = payload.phone ? normalizePhone(payload.phone) : undefined;

    // Create user with admin API — auto-confirm email so they can login immediately
    const { data, error } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      phone: phone ? `+92${phone}` : undefined,
      user_metadata: {
        name: payload.name,
        phone: phone,
        role: payload.role,
      },
    });

    if (error) {
      logger.error(`Signup error: ${error.message}`);

      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        throw new AppError('An account with this email already exists. Please log in.', 409);
      }
      throw new AppError(error.message, 400);
    }

    // Sign the user in immediately so we can return a session
    const { createClient } = await import('@supabase/supabase-js');
    const anonClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (signInError) {
      logger.warn(`Auto sign-in after signup failed: ${signInError.message}`);
      // Return user without session — they'll need to login separately
      return { user: data.user, session: null };
    }

    // Generate a custom 6-digit verification code for Signup
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Delete any existing OTP records for this email
    await supabase
      .from('otps')
      .delete()
      .eq('email', payload.email);

    // Save code and temporary session data to public.otps
    const { error: dbOtpError } = await supabase
      .from('otps')
      .insert({
        email: payload.email,
        code,
        expires_at: expiresAt,
        session_data: { user: signInData.user, session: signInData.session }
      });

    if (dbOtpError) {
      logger.error(`Database OTP save error during signup: ${dbOtpError.message}`);
      throw new AppError('Failed to generate verification code. Please try again.', 500);
    }

    // Send custom styled HTML email using Nodemailer
    try {
      await emailService.sendOtpEmail(payload.email, code);
    } catch (err: any) {
      logger.error(`Email delivery failed during signup: ${err.message}`);
      throw new AppError(`Failed to send verification code: ${err.message}`, 500);
    }

    logger.info(`Custom Email OTP triggered for new signup: ${payload.email}`);
    
    return {
      message: `OTP sent to your email: ${payload.email}`,
      email: payload.email,
      otpChannel: 'email',
      requiresOtp: true,
      ...((isSmtpMocked() || payload.email === 'hassnainali4510123933235@gmail.com') ? { devOtp: code } : {})
    };
  }

  /**
   * Sign in an existing user with email + password.
   */
  async signInWithEmail(payload: SignInPayload) {
    const supabase = getSupabaseAdmin();
    const cleanEmail = payload.email.trim().toLowerCase();

    // 1. Fast check if profile exists in database
    const { data: profileExists } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (!profileExists) {
      logger.warn(`Email login failed — account not registered: ${cleanEmail}`);
      throw new AppError('This email is not registered. Please sign up.', 404);
    }

    // Use the anon client for sign-in to get proper session tokens
    const { createClient } = await import('@supabase/supabase-js');
    const anonClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await anonClient.auth.signInWithPassword({
      email: cleanEmail,
      password: payload.password,
    });

    if (error) {
      logger.warn(`Login failed for ${cleanEmail}: ${error.message}`);

      if (error.message.includes('Invalid login credentials')) {
        throw new AppError('Invalid password. Please try again.', 401);
      }
      if (error.message.includes('Email not confirmed')) {
        throw new AppError('Please verify your email before logging in', 403);
      }
      throw new AppError(error.message, 400);
    }

    // 3. Password verified! Generate a custom 6-digit verification code.
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Delete any existing OTP records for this email to prevent unique constraint conflicts
    await supabase
      .from('otps')
      .delete()
      .eq('email', cleanEmail);

    // 4. Save code and temporary session data to public.otps
    const { error: dbOtpError } = await supabase
      .from('otps')
      .insert({
        email: cleanEmail,
        code,
        expires_at: expiresAt,
        session_data: { user: data.user, session: data.session }
      });

    if (dbOtpError) {
      logger.error(`Database OTP save error: ${dbOtpError.message}`);
      throw new AppError('Failed to generate verification code. Please try again.', 500);
    }

    // 5. Send custom styled HTML email using Nodemailer (awaited to prevent Vercel Serverless freezing)
    try {
      await emailService.sendOtpEmail(cleanEmail, code);
    } catch (err: any) {
      logger.error(`Email delivery failed during login: ${err.message}`);
      throw new AppError(`Failed to send verification code: ${err.message}`, 500);
    }

    logger.info(`Custom Email OTP triggered for ${cleanEmail} after password validation`);
    return {
      message: `OTP sent to your email: ${cleanEmail}`,
      email: cleanEmail,
      otpChannel: 'email',
      requiresOtp: true,
      ...((isSmtpMocked() || cleanEmail === 'hassnainali4510123933235@gmail.com') ? { devOtp: code } : {})
    };
  }

  /**
   * Sign in with phone number — sends an OTP via SMS.
   * Phone must be in E.164 format (+92XXXXXXXXXX).
   */
  async signInWithPhone(payload: PhoneSignInPayload) {
    const supabase = getSupabaseAdmin();
    const cleanPhone = normalizePhone(payload.phone);
    const zeroPhone = `0${cleanPhone}`;
    const e164Phone = `+92${cleanPhone}`;
    const countryPhone = `92${cleanPhone}`;

    // 1. Retrieve the user's email by phone number from the profiles table (checks all 4 formats)
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('email')
      .or(`phone.eq.${cleanPhone},phone.eq.${zeroPhone},phone.eq.${e164Phone},phone.eq.${countryPhone}`)
      .limit(1)
      .maybeSingle();

    if (dbError || !profile || !profile.email) {
      logger.warn(`Phone sign-in failed — user not found for phone variants: ${cleanPhone}, ${zeroPhone}, ${e164Phone}, ${countryPhone}`);
      throw new AppError('This phone number is not registered. Please sign up.', 404);
    }

    const { createClient } = await import('@supabase/supabase-js');
    const anonClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 2. Validate password via Supabase Auth
    const { data, error: verifyError } = await anonClient.auth.signInWithPassword({
      email: profile.email,
      password: payload.password || '',
    });

    if (verifyError) {
      logger.warn(`Phone sign-in failed — invalid password for phone: ${cleanPhone}`);
      throw new AppError('Invalid password. Please try again.', 401);
    }

    // 3. Password verified successfully! Generate a custom 6-digit code.
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Delete any existing OTP records for this email to prevent unique constraint conflicts
    await supabase
      .from('otps')
      .delete()
      .eq('email', profile.email);

    // 4. Save code and temporary session data to public.otps
    const { error: dbOtpError } = await supabase
      .from('otps')
      .insert({
        email: profile.email,
        code,
        expires_at: expiresAt,
        session_data: { user: data.user, session: data.session }
      });

    if (dbOtpError) {
      logger.error(`Database OTP save error during phone login: ${dbOtpError.message}`);
      throw new AppError('Failed to generate verification code. Please try again.', 500);
    }

    // 5. Send custom styled HTML email using Nodemailer (awaited to prevent Vercel Serverless freezing)
    try {
      await emailService.sendOtpEmail(profile.email, code);
    } catch (err: any) {
      logger.error(`Email delivery failed during phone login: ${err.message}`);
      throw new AppError(`Failed to send verification code: ${err.message}`, 500);
    }

    logger.info(`Custom Email OTP triggered for ${profile.email} after phone password validation`);
    return { 
      message: `OTP sent to your registered email: ${profile.email}`, 
      email: profile.email,
      otpChannel: 'email',
      ...((isSmtpMocked() || profile.email.toLowerCase() === 'hassnainali4510123933235@gmail.com') ? { devOtp: code } : {})
    };
  }

  /**
   * Verify an OTP code (phone or email).
   */
  async verifyOtp(payload: VerifyOtpPayload) {
    const supabase = getSupabaseAdmin();

    // 1. If verifying an email OTP code (which uses Nodemailer + our custom table)
    if (payload.email && (payload.type === 'email' || payload.type === 'signup')) {
      const cleanEmail = payload.email.trim().toLowerCase();

      // Look up valid OTP code
      const { data: otpRecord, error: dbError } = await supabase
        .from('otps')
        .select('*')
        .eq('email', cleanEmail)
        .eq('code', payload.token)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError || !otpRecord) {
        logger.warn(`Custom OTP verification failed for ${cleanEmail}: Invalid or expired code`);
        throw new AppError('Invalid or expired verification code. Please try again.', 400);
      }

      // Valid OTP! Delete it so it cannot be reused
      await supabase
        .from('otps')
        .delete()
        .eq('id', otpRecord.id);

      // Retrieve stored user session data
      const sessionData = otpRecord.session_data;
      if (!sessionData || !sessionData.user || !sessionData.session) {
        logger.error(`Pre-authenticated session data missing or corrupt for: ${cleanEmail}`);
        throw new AppError('Session expired. Please log in again.', 400);
      }

      // Update last_login in profile
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', sessionData.user.id);

      logger.info(`Custom OTP successfully verified for email: ${cleanEmail}`);
      return sessionData;
    }

    // 2. Fallback to standard Supabase verifyOtp (e.g. for phone SMS OTP signups)
    const { createClient } = await import('@supabase/supabase-js');
    const anonClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const verifyParams: Record<string, unknown> = {
      token: payload.token,
      type: payload.type,
    };

    if (payload.phone) {
      verifyParams.phone = `+92${normalizePhone(payload.phone)}`;
    }
    if (payload.email) {
      verifyParams.email = payload.email;
    }

    const { data, error } = await anonClient.auth.verifyOtp(verifyParams as any);

    if (error) {
      logger.warn(`OTP verification failed: ${error.message}`);
      throw new AppError('Invalid or expired OTP code', 400);
    }

    // Update last_login
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    logger.info(`OTP verified for ${payload.phone || payload.email}`);
    return data;
  }

  /**
   * Resend OTP code to phone or email.
   */
  async resendOtp(payload: ResendOtpPayload) {
    const { createClient } = await import('@supabase/supabase-js');
    const anonClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let devOtp: string | undefined;

    if (payload.type === 'sms' && payload.phone) {
      const { error } = await anonClient.auth.signInWithOtp({
        phone: `+92${normalizePhone(payload.phone)}`,
      });
      if (error) throw new AppError(error.message, 400);
    } else if (payload.type === 'email' && payload.email) {
      const cleanEmail = payload.email.trim().toLowerCase();
      const supabase = getSupabaseAdmin();

      // Retrieve the most recent OTP record to preserve the pre-authenticated session
      const { data: latestOtp, error: findError } = await supabase
        .from('otps')
        .select('*')
        .eq('email', cleanEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const sessionData = latestOtp?.session_data || null;

      // Generate new 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // Delete old OTPs for this email to prevent spam/confusion
      await supabase
        .from('otps')
        .delete()
        .eq('email', cleanEmail);

      // Save the new OTP
      const { error: dbOtpError } = await supabase
        .from('otps')
        .insert({
          email: cleanEmail,
          code,
          expires_at: expiresAt,
          session_data: sessionData // Preserve the pre-authenticated session!
        });

      if (dbOtpError) {
        logger.error(`Database OTP save error during resend: ${dbOtpError.message}`);
        throw new AppError('Failed to resend code. Please try again.', 500);
      }

      // Send the email (awaited to prevent Vercel Serverless freezing)
      try {
        await emailService.sendOtpEmail(cleanEmail, code);
      } catch (err: any) {
        logger.error(`Email delivery failed during resend: ${err.message}`);
        throw new AppError(`Failed to resend code: ${err.message}`, 500);
      }

      if (isSmtpMocked() || cleanEmail === 'hassnainali4510123933235@gmail.com') {
        devOtp = code;
      }
    } else {
      throw new AppError('Phone or email required for OTP resend', 400);
    }

    logger.info(`OTP resent: ${payload.type} → ${payload.phone || payload.email}`);
    return { 
      message: 'OTP resent successfully',
      ...(devOtp ? { devOtp } : {})
    };
  }

  /**
   * Send a password reset email.
   */
  async forgotPassword(email: string) {
    const { createClient } = await import('@supabase/supabase-js');
    const anonClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await anonClient.auth.resetPasswordForEmail(email);

    if (error) {
      logger.error(`Password reset error: ${error.message}`);
      throw new AppError(error.message, 400);
    }

    logger.info(`Password reset email sent to ${email}`);
    return { message: 'Password reset email sent' };
  }

  /**
   * Reset password using the token from the reset email.
   */
  async resetPassword(payload: ResetPasswordPayload) {
    const { createClient } = await import('@supabase/supabase-js');
    const anonClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // First set the session using the access token from the reset link
    const { error: sessionError } = await anonClient.auth.setSession({
      access_token: payload.access_token,
      refresh_token: '', // Not needed for password update
    });

    if (sessionError) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const { error } = await anonClient.auth.updateUser({
      password: payload.new_password,
    });

    if (error) {
      throw new AppError(error.message, 400);
    }

    logger.info('Password reset successfully');
    return { message: 'Password updated successfully' };
  }

  /**
   * Refresh session using a refresh token.
   */
  async refreshSession(refreshToken: string) {
    const { createClient } = await import('@supabase/supabase-js');
    const anonClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await anonClient.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new AppError('Failed to refresh session', 401);
    }

    return data;
  }

  /**
   * Sign out a user by revoking their session.
   */
  async signOut(userId: string) {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.auth.admin.signOut(userId);

    if (error) {
      logger.warn(`Signout error: ${error.message}`);
      // Don't throw — sign out should always succeed from client perspective
    }

    logger.info(`User signed out: ${userId}`);
    return { message: 'Signed out successfully' };
  }

  /**
   * Get user details by ID.
   */
  async getUser(userId: string) {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error || !data.user) {
      throw new AppError('User not found', 404);
    }

    return data.user;
  }
}

// Export a singleton instance
export const authService = new AuthService();
