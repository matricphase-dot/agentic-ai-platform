import { Resend } from 'resend';
import { logger } from '../lib/logger';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

const FROM = 'onboarding@resend.dev';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const wrapTemplate = (content: string, ctaText?: string, ctaLink?: string) => `
  <div style="background-color: #0A0A0A; color: #FFFFFF; font-family: system-ui, -apple-system, sans-serif; padding: 40px 20px; line-height: 1.6;">
    <div style="max-width: 560px; margin: 0 auto; background-color: #111111; border: 1px solid #1E1E1E; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="margin-bottom: 32px;">
        <span style="font-size: 24px; font-weight: 800; letter-spacing: -1px;">Agentic<span style="color: #7C3AED;">AI</span></span>
      </div>
      
      ${content}
      
      ${ctaText && ctaLink ? `
        <div style="margin-top: 32px;">
          <a href="${ctaLink}" style="display: inline-block; background-color: #7C3AED; color: #FFFFFF; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; transition: all 0.2s;">
            ${ctaText}
          </a>
        </div>
      ` : ''}
      
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #1E1E1E; color: #666666; font-size: 12px; text-align: center;">
        AgenticAI — The Infrastructure Layer for the AI Agent Economy
      </div>
    </div>
  </div>
`;

export const EmailService = {
  sendVerification: async (email: string, name: string, token: string): Promise<void> => {
    const url = `${FRONTEND_URL}/auth/verify-email?token=${token}`;
    const subject = "Verify your AgenticAI account";
    const html = wrapTemplate(`
      <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px;">Verify your email</h1>
      <p style="color: #A0A0A0; font-size: 16px; margin-bottom: 24px;">Hi ${name}, welcome to the autonomous economy. Please verify your email to activate your account.</p>
    `, "Verify Email", url);

    if (!resend) {
      logger.info('📧 [DEV MODE] Verification Email:', { to: email, url });
      return;
    }

    try {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject,
        html,
        text: `Verify your AgenticAI account: ${url}`
      });
      logger.info('Verification email sent via Resend', { email });
    } catch (error) {
      logger.error('Failed to send verification email via Resend', { email, error });
    }
  },

  sendPasswordReset: async (email: string, name: string, token: string): Promise<void> => {
    const url = `${FRONTEND_URL}/auth/reset-password?token=${token}`;
    const subject = "Reset your AgenticAI password";
    const html = wrapTemplate(`
      <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px;">Reset password</h1>
      <p style="color: #A0A0A0; font-size: 16px; margin-bottom: 24px;">Hi ${name}, we received a request to reset your password. This link will expire in 1 hour.</p>
    `, "Reset Password", url);

    if (!resend) {
      logger.info('📧 [DEV MODE] Password Reset Email:', { to: email, url });
      return;
    }

    try {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject,
        html,
        text: `Reset your AgenticAI password: ${url}`
      });
      logger.info('Password reset email sent via Resend', { email });
    } catch (error) {
      logger.error('Failed to send password reset email via Resend', { email, error });
    }
  },

  sendWelcome: async (email: string, name: string): Promise<void> => {
    const subject = "Welcome to AgenticAI — you're in!";
    const html = wrapTemplate(`
      <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px;">You're in, ${name}!</h1>
      <p style="color: #A0A0A0; font-size: 16px; margin-bottom: 24px;">Your account is verified. Here are 5 things you can do right now:</p>
      <ul style="color: #A0A0A0; font-size: 14px; padding-left: 20px; margin-bottom: 24px;">
        <li style="margin-bottom: 8px;">🤖 Create and deploy your first AI agent</li>
        <li style="margin-bottom: 8px;">🛒 Browse high-performance agents in the Marketplace</li>
        <li style="margin-bottom: 8px;">💰 Stake AGNT tokens to earn protocol rewards</li>
        <li style="margin-bottom: 8px;">🖥️ Register a compute node to power the network</li>
        <li style="margin-bottom: 8px;">🗳️ Vote on governance proposals</li>
      </ul>
    `, "Go to Dashboard", `${FRONTEND_URL}/dashboard`);

    if (!resend) {
      logger.info('📧 [DEV MODE] Welcome Email:', { to: email });
      return;
    }

    try {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject,
        html,
        text: `Welcome to AgenticAI, ${name}! Your account is verified.`
      });
      logger.info('Welcome email sent via Resend', { email });
    } catch (error) {
      logger.error('Failed to send welcome email via Resend', { email, error });
    }
  },

  verifyConnection: async (): Promise<boolean> => {
    if (process.env.RESEND_API_KEY) {
      logger.info('Resend email service ready');
    } else {
      logger.info('RESEND_API_KEY not set — emails will be logged to console only');
    }
    return true;
  }
};
