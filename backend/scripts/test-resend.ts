import { Resend } from 'resend';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set - skipping test');
    return;
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'delivered@resend.dev',
      subject: 'AgenticAI test email',
      html: '<p>Email service working!</p>',
    });
    console.log('Resend test passed:', result);
  } catch (error) {
    console.error('Resend test failed:', error);
  }
}

test();
