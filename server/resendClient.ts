import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X-Replit-Token not found for repl/depl');
  }

  const response = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X-Replit-Token': xReplitToken
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Resend connector fetch failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  connectionSettings = data.items?.[0];

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

export async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail || 'noreply@easybookpublishers.com',
    brandFromEmail: 'Easy Book Publishers <noreply@easybookpublishers.com>',
  };
}

export async function sendConfirmationEmail(toEmail: string, token: string, userName: string) {
  const { client, brandFromEmail } = await getUncachableResendClient();

  const confirmUrl = `https://easybookpublishers.com/confirm-email?token=${token}`;

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
