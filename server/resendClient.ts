import { Resend } from 'resend';

function getApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return apiKey;
}

export function getUncachableResendClient() {
  const apiKey = getApiKey();
  return {
    client: new Resend(apiKey),
    brandFromEmail: 'Easy Book Publishers <noreply@easybookpublishers.com>',
  };
}

export async function sendConfirmationEmail(toEmail: string, token: string, userName: string) {
  const { client, brandFromEmail } = getUncachableResendClient();

  const baseUrl = process.env.REPLIT_DEPLOYMENT === '1'
    ? 'https://book-production-flowchart.replit.app'
    : `https://${process.env.REPLIT_DEV_DOMAIN || 'book-production-flowchart.replit.app'}`;
  const confirmUrl = `${baseUrl}/confirm-email?token=${token}`;

  const { data, error } = await client.emails.send({
    from: brandFromEmail,
    to: toEmail,
    subject: 'Confirm your email — Easy Book Publishers',
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #f3efe6; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a1008; font-size: 24px; margin: 0;">Easy Book Publishers</h1>
        </div>
        <p style="color: #3a2a14; font-size: 16px; line-height: 1.6;">
          Hi ${userName},
        </p>
        <p style="color: #3a2a14; font-size: 16px; line-height: 1.6;">
          Thank you for creating an account. Please confirm your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${confirmUrl}" style="display: inline-block; background-color: #c9a96e; color: #1a1008; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
            Confirm My Email
          </a>
        </div>
        <p style="color: #7a6e60; font-size: 13px; line-height: 1.5;">
          Or copy and paste this link into your browser:<br/>
          <a href="${confirmUrl}" style="color: #8b6914; word-break: break-all;">${confirmUrl}</a>
        </p>
        <p style="color: #7a6e60; font-size: 13px; line-height: 1.5;">
          This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #c9a96e33; margin: 24px 0;" />
        <p style="color: #a89a8a; font-size: 12px; text-align: center;">
          Easy Book Publishers — Manuscript to Masterpiece
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('[Resend] Failed to send confirmation email:', error);
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  }

  console.log(`[Resend] Confirmation email sent to ${toEmail}, id=${data?.id}`);
  return data;
}

export async function sendPasswordResetEmail(toEmail: string, token: string, userName: string) {
  const { client, brandFromEmail } = getUncachableResendClient();

  const baseUrl = process.env.REPLIT_DEPLOYMENT === '1'
    ? 'https://book-production-flowchart.replit.app'
    : `https://${process.env.REPLIT_DEV_DOMAIN || 'book-production-flowchart.replit.app'}`;
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const { data, error } = await client.emails.send({
    from: brandFromEmail,
    to: toEmail,
    subject: 'Reset your password — Easy Book Publishers',
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #f3efe6; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a1008; font-size: 24px; margin: 0;">Easy Book Publishers</h1>
        </div>
        <p style="color: #3a2a14; font-size: 16px; line-height: 1.6;">
          Hi ${userName || 'there'},
        </p>
        <p style="color: #3a2a14; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new one:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #c9a96e; color: #1a1008; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
            Reset My Password
          </a>
        </div>
        <p style="color: #7a6e60; font-size: 13px; line-height: 1.5;">
          Or copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #8b6914; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="color: #7a6e60; font-size: 13px; line-height: 1.5;">
          This link expires in 15 minutes. If you didn't request this, you can safely ignore this email — your password will not be changed.
        </p>
        <hr style="border: none; border-top: 1px solid #c9a96e33; margin: 24px 0;" />
        <p style="color: #a89a8a; font-size: 12px; text-align: center;">
          Easy Book Publishers — Manuscript to Masterpiece
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('[Resend] Failed to send password reset email:', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }

  console.log(`[Resend] Password reset email sent to ${toEmail}, id=${data?.id}`);
  return data;
}

export async function sendLoginEmail(toEmail: string, token: string, userName: string) {
  const { client, brandFromEmail } = getUncachableResendClient();

  const baseUrl = process.env.REPLIT_DEPLOYMENT === '1'
    ? 'https://book-production-flowchart.replit.app'
    : `https://${process.env.REPLIT_DEV_DOMAIN || 'book-production-flowchart.replit.app'}`;
  const loginUrl = `${baseUrl}/api/auth/magic-login?token=${token}`;

  const { data, error } = await client.emails.send({
    from: brandFromEmail,
    to: toEmail,
    subject: 'Sign in to Easy Book Publishers',
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #f3efe6; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a1008; font-size: 24px; margin: 0;">Easy Book Publishers</h1>
        </div>
        <p style="color: #3a2a14; font-size: 16px; line-height: 1.6;">
          Hi ${userName},
        </p>
        <p style="color: #3a2a14; font-size: 16px; line-height: 1.6;">
          Click the button below to sign in to your account:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${loginUrl}" style="display: inline-block; background-color: #c9a96e; color: #1a1008; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
            Sign In
          </a>
        </div>
        <p style="color: #7a6e60; font-size: 13px; line-height: 1.5;">
          Or copy and paste this link into your browser:<br/>
          <a href="${loginUrl}" style="color: #8b6914; word-break: break-all;">${loginUrl}</a>
        </p>
        <p style="color: #7a6e60; font-size: 13px; line-height: 1.5;">
          This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #c9a96e33; margin: 24px 0;" />
        <p style="color: #a89a8a; font-size: 12px; text-align: center;">
          Easy Book Publishers — Manuscript to Masterpiece
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('[Resend] Failed to send login email:', error);
    throw new Error(`Failed to send login email: ${error.message}`);
  }

  console.log(`[Resend] Login email sent to ${toEmail}, id=${data?.id}`);
  return data;
}

export async function sendAffiliateWelcomeEmail(toEmail: string, name: string, affiliateCode: string) {
  const { client, brandFromEmail } = getUncachableResendClient();

  const dashboardUrl = 'https://book-production-flowchart.replit.app/affiliate-dashboard';

  const { data, error } = await client.emails.send({
    from: brandFromEmail,
    to: toEmail,
    subject: 'Welcome to the Easy Book Publishers Affiliate Program!',
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #f3efe6; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a1008; font-size: 24px; margin: 0;">Easy Book Publishers</h1>
          <p style="color: #c9a96e; font-size: 14px; margin: 4px 0 0;">Affiliate Program</p>
        </div>
        <p style="color: #3a2a14; font-size: 16px; line-height: 1.6;">
          Hi ${name},
        </p>
        <p style="color: #3a2a14; font-size: 16px; line-height: 1.6;">
          Welcome to our affiliate program! Your application has been approved and you're ready to start earning 20% commission on every sale.
        </p>
        <div style="background: #fff; border: 1px solid #c9a96e33; border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
          <p style="color: #7a6e60; font-size: 13px; margin: 0 0 4px;">Your Affiliate Code</p>
          <p style="color: #1a1008; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 0.5px;">${affiliateCode}</p>
        </div>
        <p style="color: #3a2a14; font-size: 16px; line-height: 1.6;">
          Use this code to log in to your affiliate dashboard and access your referral links, marketing assets, and earnings reports.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background-color: #c9a96e; color: #1a1008; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
            Go to Affiliate Dashboard
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #c9a96e33; margin: 24px 0;" />
        <p style="color: #a89a8a; font-size: 12px; text-align: center;">
          Easy Book Publishers — Manuscript to Masterpiece
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('[Resend] Failed to send affiliate welcome email:', error);
    throw new Error(`Failed to send affiliate welcome email: ${error.message}`);
  }

  console.log(`[Resend] Affiliate welcome email sent to ${toEmail}, id=${data?.id}`);
  return data;
}

export async function sendAffiliateNotificationToOwner(affiliateName: string, affiliateEmail: string, affiliateCode: string) {
  const { client, brandFromEmail } = getUncachableResendClient();

  const ownerEmail = 'alamotte1956@gmail.com';

  const { data, error } = await client.emails.send({
    from: brandFromEmail,
    to: ownerEmail,
    subject: `New Affiliate Signup: ${affiliateName}`,
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #f3efe6; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1a1008; font-size: 24px; margin: 0;">New Affiliate Signup</h1>
        </div>
        <p style="color: #3a2a14; font-size: 16px; line-height: 1.6;">
          A new affiliate has signed up for the Easy Book Publishers program:
        </p>
        <div style="background: #fff; border: 1px solid #c9a96e33; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="color: #3a2a14; font-size: 15px; margin: 4px 0;"><strong>Name:</strong> ${affiliateName}</p>
          <p style="color: #3a2a14; font-size: 15px; margin: 4px 0;"><strong>Email:</strong> ${affiliateEmail}</p>
          <p style="color: #3a2a14; font-size: 15px; margin: 4px 0;"><strong>Code:</strong> ${affiliateCode}</p>
        </div>
        <p style="color: #7a6e60; font-size: 13px; line-height: 1.5;">
          This affiliate was auto-approved and can start referring immediately.
        </p>
        <hr style="border: none; border-top: 1px solid #c9a96e33; margin: 24px 0;" />
        <p style="color: #a89a8a; font-size: 12px; text-align: center;">
          Easy Book Publishers — Manuscript to Masterpiece
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('[Resend] Failed to send affiliate notification to owner:', error);
  } else {
    console.log(`[Resend] Affiliate notification sent to owner, id=${data?.id}`);
  }
}
