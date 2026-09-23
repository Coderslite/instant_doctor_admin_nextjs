// Base URL of the mail backend. Set NEXT_PUBLIC_MAIL_API_URL to point at the
// deployed API, e.g. https://us-central1-instant-doctor-a4e4c.cloudfunctions.net/api
export const MAIL_API_URL = process.env.NEXT_PUBLIC_MAIL_API_URL ?? 'http://localhost:3003';

// The backend's newsletter endpoint takes a list of recipients; individual
// mail goes through it with a single address.
export async function sendMail(options: { subject: string; html: string; emails: string[] }) {
    const response = await fetch(`${MAIL_API_URL}/mail/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || `Mail server responded with ${response.status}`);
    }
    return data as { message?: string };
}

const escapeHtml = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const BRAND = {
    name: 'Instant Doctor',
    website: 'https://instantdoctor.co',
    logo: 'https://instantdoctor.co/images/logo2.png',
    primary: '#00aeef',
    dark: '#0b4ea2',
    text: '#1f2937',
    muted: '#6b7280',
    background: '#f4f7fb',
    border: '#e5e7eb',
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export interface PersonalEmailOptions {
    recipientName: string;
    subject: string;
    message: string;
    // Optional call-to-action button; only rendered when both are set
    ctaText?: string;
    ctaUrl?: string;
}

// Only allow http(s) links in the button
export const isSafeUrl = (url?: string) => !!url && /^https?:\/\/[^\s]+$/i.test(url.trim());

// Builds a standard, responsive transactional email. Table-based layout with
// inline styles so it renders consistently in Gmail, Outlook, Apple Mail and
// mobile clients; the <style> block only adds mobile tweaks and a dark-mode guard.
export function buildPersonalEmailHtml({ recipientName, subject, message, ctaText, ctaUrl }: PersonalEmailOptions) {
    const paragraphs = escapeHtml(message.trim())
        .split(/\n{2,}/)
        .filter(Boolean)
        .map(paragraph =>
            `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:26px;color:${BRAND.text};">${paragraph.replace(/\n/g, '<br>')}</p>`
        )
        .join('\n');

    // Inbox preview text: first line of the message
    const preheader = escapeHtml(message.trim().replace(/\s+/g, ' ').slice(0, 110));

    const showButton = ctaText?.trim() && isSafeUrl(ctaUrl);
    const button = showButton ? `
                <table role="presentation" class="button-table" border="0" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
                  <tr>
                    <td align="center" bgcolor="${BRAND.primary}" style="border-radius:8px;">
                      <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${escapeHtml(ctaUrl!.trim())}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="17%" stroke="f" fillcolor="${BRAND.primary}"><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${escapeHtml(ctaText!.trim())}</center></v:roundrect><![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${escapeHtml(ctaUrl!.trim())}" target="_blank" class="button" style="display:inline-block;padding:14px 32px;font-family:${FONT};font-size:16px;font-weight:600;line-height:20px;color:#ffffff;text-decoration:none;border-radius:8px;background-color:${BRAND.primary};">${escapeHtml(ctaText!.trim())}</a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>` : '';

    const year = new Date().getFullYear();

    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    a { color:${BRAND.primary}; }
    @media only screen and (max-width:620px) {
      .container { width:100% !important; }
      .outer-pad { padding:16px 12px !important; }
      .content { padding:28px 20px !important; }
      .header { padding:20px 20px !important; }
      .footer { padding:24px 20px !important; }
      .content-help { padding:0 20px 28px !important; }
      .greeting { font-size:20px !important; line-height:28px !important; }
      .button-table { width:100% !important; }
      .button { display:block !important; text-align:center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.background};">
  <!-- Preheader (hidden inbox preview text) -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${preheader}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>

  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:${BRAND.background};">
    <tr>
      <td align="center" class="outer-pad" style="padding:32px 16px;">
        <!--[if mso]><table role="presentation" width="600" border="0" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table role="presentation" class="container" width="600" border="0" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <!-- Accent bar -->
                <tr><td height="4" style="height:4px;line-height:4px;font-size:4px;background-color:${BRAND.primary};border-radius:12px 12px 0 0;">&nbsp;</td></tr>

                <!-- Header -->
                <tr>
                  <td class="header" style="padding:24px 40px;border-bottom:1px solid ${BRAND.border};">
                    <a href="${BRAND.website}" target="_blank" style="text-decoration:none;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:middle;padding-right:4px;">
                            <img src="${BRAND.logo}" width="48" height="48" alt="${BRAND.name}" style="display:block;width:48px;height:48px;">
                          </td>
                          <td style="vertical-align:middle;font-family:${FONT};font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                            <span style="color:${BRAND.primary};">Instant</span><span style="color:${BRAND.dark};">Doctor</span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td class="content" style="padding:40px 40px 32px;">
                    <h1 class="greeting" style="margin:0 0 20px;font-family:${FONT};font-size:22px;line-height:30px;font-weight:700;color:${BRAND.text};">Hi ${escapeHtml(recipientName.trim() || 'there')},</h1>
                    ${paragraphs}
                    ${button}
                    <p style="margin:24px 0 0;font-family:${FONT};font-size:16px;line-height:26px;color:${BRAND.text};">
                      Warm regards,<br>
                      <strong>The ${BRAND.name} Team</strong>
                    </p>
                  </td>
                </tr>

                <!-- Help strip -->
                <tr>
                  <td style="padding:0 40px 32px;" class="content-help">
                    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#f0f9ff;border-radius:8px;">
                      <tr>
                        <td style="padding:16px 20px;font-family:${FONT};font-size:14px;line-height:22px;color:${BRAND.muted};">
                          Have a question? Simply reply to this email, our team is happy to help.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer" align="center" style="padding:28px 40px;font-family:${FONT};font-size:12px;line-height:20px;color:${BRAND.muted};">
              <p style="margin:0 0 8px;">
                <a href="${BRAND.website}" target="_blank" style="color:${BRAND.dark};text-decoration:none;font-weight:600;">instantdoctor.co</a>
              </p>
              <p style="margin:0 0 8px;">You're receiving this email because you have an ${BRAND.name} account.</p>
              <p style="margin:0;">&copy; ${year} ${BRAND.name}. All rights reserved.</p>
            </td>
          </tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}
