/**
 * Email Service for Verification Codes
 * 
 * This uses EmailJS for client-side email sending.
 * To set up:
 * 1. Create account at https://www.emailjs.com/
 * 2. Create an email service (Gmail, Outlook, etc.)
 * 3. Create an email template with variables: {{to_email}}, {{user_name}}, {{verification_code}}
 * 4. Add these to .env.local:
 *    NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
 *    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
 *    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
 */

interface EmailParams {
  to_email: string;
  user_name: string;
  verification_code: string;
  [key: string]: unknown;
}

export async function sendVerificationCodeEmail(
  email: string,
  name: string,
  code: string
): Promise<void> {
  if (!email) {
    console.error('❌ SendVerificationCodeEmail called with empty email');
    return;
  }
  // For now, we'll use a simple console log approach
  // In production, you would integrate with EmailJS or another service

  console.log('='.repeat(60));
  console.log('📧 VERIFICATION EMAIL');
  console.log('='.repeat(60));
  console.log(`To: ${email}`);
  console.log(`Name: ${name}`);
  console.log(`Verification Code: ${code}`);
  console.log('='.repeat(60));
  console.log('');
  console.log('Email content:');
  console.log(`Hello ${name},`);
  console.log('');
  console.log('Your verification code is:');
  console.log('');
  console.log(`    ${code}`);
  console.log('');
  console.log('This code will expire in 15 minutes.');
  console.log('If you did not request this code, please ignore this email.');
  console.log('='.repeat(60));

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Integrate with EmailJS
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (serviceId && templateId && publicKey) {
    try {
      console.log(`🚀 Attempting to send email via EmailJS...`);
      console.log(`   Service ID: ${serviceId.substring(0, 4)}...`);
      console.log(`   Template ID: ${templateId.substring(0, 4)}...`);
      console.log(`   Public Key: ${publicKey.substring(0, 4)}...`);

      const emailjs = (await import('@emailjs/browser')).default;

      const templateParams: EmailParams = {
        to_email: email,
        user_name: name,
        verification_code: code,
      };

      const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log('✅ Email sent successfully!', response.status, response.text);
    } catch (error: any) {
      console.error('❌ Failed to send email via EmailJS:', JSON.stringify(error, null, 2));
      if (error?.text) console.error('   Error Text:', error.text);
      // We don't throw here so the flow continues (user sees code in toast)
    }
  } else {
    console.warn('⚠️ EmailJS credentials missing or incomplete.');
  }
}

export async function sendBackupDataEmail(
  email: string,
  name: string,
  backupData: string,
  filename: string
): Promise<void> {
  if (!email) return;

  console.log(`🚀 Attempting to send backup email to ${email}...`);

  // Integrate with EmailJS
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (serviceId && templateId && publicKey) {
    try {
      const emailjs = (await import('@emailjs/browser')).default;

      // Note: Attachments via EmailJS purely client-side can be limited.
      // We are passing the data as a template parameter 'backup_data'.
      // The template in EmailJS should handle this, or the user should configure it.
      const templateParams = {
        to_email: email,
        user_name: name,
        backup_data: backupData,
        filename: filename
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log('✅ Backup email sent successfully!');
    } catch (error) {
      console.error('❌ Failed to send backup email:', error);
      throw error;
    }
  } else {
    console.warn('EmailJS credentials missing.');
    throw new Error("EmailJS credentials missing");
  }
}

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
