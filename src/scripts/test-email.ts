import dotenv from 'dotenv';
import { verifyEmailConnection, sendWelcomeEmail } from '../services/EmailService';

// Load environment variables
dotenv.config();

/**
 * Script to test the email service connection and sending functionality
 */
async function testEmailService() {
  try {
    console.log('🔍 Verifying email service connection...');
    const isConnected = await verifyEmailConnection();
    
    if (!isConnected) {
      console.error('❌ Failed to connect to email service. Check your email configuration.');
      process.exit(1);
    }
    
    console.log('✅ Email service connection verified successfully.');
    
    // Test sending a welcome email
    console.log('📧 Sending a test welcome email...');
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    await sendWelcomeEmail(testEmail, 'Test User', 'Author');
    
    console.log(`✅ Test welcome email sent to ${testEmail}. Check your inbox.`);
    console.log('📝 Note: If you used a dummy email, check your SMTP server logs.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing email service:', error);
    process.exit(1);
  }
}

// Run the test
testEmailService();
