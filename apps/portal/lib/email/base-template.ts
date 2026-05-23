/**
 * Base Email Template - Restaurant Hub Solution
 * Professional B2B email design system matching market standards
 * 
 * Design principles:
 * - Mobile-first responsive (600px max width)
 * - Brand consistent (orange primary)
 * - High deliverability (inline styles, clean HTML)
 * - Accessibility compliant
 * - Dark mode support via prefers-color-scheme
 */

export interface BaseTemplateOptions {
  preheader?: string;
  showLogo?: boolean;
  showFooter?: boolean;
  showSocial?: boolean;
  backgroundColor?: string;
}

// Brand colors - RHS Orange Theme
export const brandColors = {
  primary: '#f0531c',       // RHS Orange
  primaryDark: '#c24215',   // RHS Orange Dark
  primaryLight: '#ff6b35',  // RHS Orange Light
  secondary: '#111827',     // Gray 900
  background: '#f9fafb',    // Gray 50
  surface: '#ffffff',
  text: '#374151',          // Gray 700
  textLight: '#6b7280',     // Gray 500
  textMuted: '#9ca3af',     // Gray 400
  border: '#e5e7eb',        // Gray 200
  success: '#10b981',       // Emerald for success states
  warning: '#f59e0b',
  error: '#ef4444',
};

export const baseStyles = `
  /* Reset */
  body, table, td, p, a, li, blockquote {
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
  table, td {
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }
  img {
    -ms-interpolation-mode: bicubic;
    border: 0;
    height: auto;
    line-height: 100%;
    outline: none;
    text-decoration: none;
  }
  /* Typography */
  body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
  }
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .email-bg { background-color: #1f2937 !important; }
    .email-surface { background-color: #374151 !important; }
    .email-text { color: #f9fafb !important; }
    .email-text-light { color: #d1d5db !important; }
  }
  /* Mobile responsive */
  @media only screen and (max-width: 620px) {
    .email-container { width: 100% !important; padding: 0 16px !important; }
    .email-content { padding: 24px 16px !important; }
    .email-button { width: 100% !important; display: block !important; }
    .mobile-hidden { display: none !important; }
    .mobile-full { width: 100% !important; display: block !important; }
  }
`;

export function generateBaseTemplate(
  content: string, 
  options: BaseTemplateOptions = {}
): string {
  const {
    preheader = '',
    showLogo = true,
    showFooter = true,
    showSocial = true,
    backgroundColor = brandColors.background,
  } = options;

  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Restaurant Hub Solution</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    ${baseStyles}
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  
  <!-- Preheader text (hidden, shows in inbox preview) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}
    ${'&nbsp;'.repeat(150)}
  </div>

  <!-- Email wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${backgroundColor};" class="email-bg">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        
        <!-- Email container (600px max) -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto;" class="email-container">
          
          ${showLogo ? generateHeader() : ''}
          
          <!-- Main content -->
          <tr>
            <td style="background-color: ${brandColors.surface}; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              ${content}
            </td>
          </tr>

          ${showFooter ? generateFooter(showSocial) : ''}
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateHeader(): string {
  return `
  <!-- Logo Header -->
  <tr>
    <td align="center" style="padding: 24px 0 16px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="vertical-align: middle; padding-right: 12px;">
            <img src="https://restauranthubsolution.com/logo-500.png" alt="Restaurant Hub Solution" width="40" height="40" style="display: block; border-radius: 8px;" />
          </td>
          <td style="vertical-align: middle;">
            <span style="font-size: 20px; font-weight: 700; color: ${brandColors.secondary};">Restaurant Hub Solution</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  `;
}

function generateFooter(showSocial: boolean): string {
  const currentYear = new Date().getFullYear();
  
  return `
  <!-- Footer -->
  <tr>
    <td style="padding: 32px 24px; text-align: center;">
      ${showSocial ? `
      <!-- Social links -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 16px;">
        <tr>
          <td style="padding: 0 8px;">
            <a href="https://twitter.com/restauranthub" style="display: inline-block; width: 32px; height: 32px; background: ${brandColors.border}; border-radius: 50%; text-decoration: none;">
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/twitter.svg" alt="Twitter" width="16" height="16" style="margin: 8px; opacity: 0.6;">
            </a>
          </td>
          <td style="padding: 0 8px;">
            <a href="https://linkedin.com/company/restauranthub" style="display: inline-block; width: 32px; height: 32px; background: ${brandColors.border}; border-radius: 50%; text-decoration: none;">
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/linkedin.svg" alt="LinkedIn" width="16" height="16" style="margin: 8px; opacity: 0.6;">
            </a>
          </td>
          <td style="padding: 0 8px;">
            <a href="https://facebook.com/restauranthub" style="display: inline-block; width: 32px; height: 32px; background: ${brandColors.border}; border-radius: 50%; text-decoration: none;">
              <img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/facebook.svg" alt="Facebook" width="16" height="16" style="margin: 8px; opacity: 0.6;">
            </a>
          </td>
        </tr>
      </table>
      ` : ''}
      
      <!-- Company info -->
      <p style="margin: 0 0 8px; font-size: 13px; color: ${brandColors.textMuted};">
        Restaurant Hub Solution • B2B Restaurant Supply Platform
      </p>
      <p style="margin: 0 0 16px; font-size: 12px; color: ${brandColors.textMuted};">
        123 Business Ave, Suite 400 • New York, NY 10001
      </p>
      
      <!-- Legal links -->
      <p style="margin: 0; font-size: 12px; color: ${brandColors.textMuted};">
        <a href="%unsubscribe_url%" style="color: ${brandColors.textMuted}; text-decoration: underline;">Unsubscribe</a>
        &nbsp;•&nbsp;
        <a href="https://restauranthubsolution.com/privacy-policy" style="color: ${brandColors.textMuted}; text-decoration: underline;">Privacy Policy</a>
        &nbsp;•&nbsp;
        <a href="https://restauranthubsolution.com/terms-of-service" style="color: ${brandColors.textMuted}; text-decoration: underline;">Terms of Service</a>
      </p>
      
      <p style="margin: 16px 0 0; font-size: 11px; color: ${brandColors.textMuted};">
        © ${currentYear} Restaurant Hub Solution. All rights reserved.
      </p>
    </td>
  </tr>
  `;
}

// Reusable email components
export const components = {
  button: (text: string, url: string, variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
    const styles = {
      primary: `background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryDark} 100%); color: white;`,
      secondary: `background: ${brandColors.secondary}; color: white;`,
      outline: `background: transparent; color: ${brandColors.primary}; border: 2px solid ${brandColors.primary};`,
    };
    
    return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
      <tr>
        <td>
          <a href="${url}" target="_blank" style="display: inline-block; ${styles[variant]} padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; text-align: center; mso-padding-alt: 0;" class="email-button">
            <!--[if mso]><i style="letter-spacing: 32px; mso-font-width: -100%; mso-text-raise: 24pt;">&nbsp;</i><![endif]-->
            <span style="mso-text-raise: 12pt;">${text}</span>
            <!--[if mso]><i style="letter-spacing: 32px; mso-font-width: -100%;">&nbsp;</i><![endif]-->
          </a>
        </td>
      </tr>
    </table>
    `;
  },

  heading: (text: string, level: 1 | 2 | 3 = 1) => {
    const sizes = { 1: '28px', 2: '22px', 3: '18px' };
    const margins = { 1: '0 0 16px', 2: '0 0 12px', 3: '0 0 8px' };
    return `<h${level} style="margin: ${margins[level]}; font-size: ${sizes[level]}; font-weight: 700; color: ${brandColors.secondary}; line-height: 1.3;">${text}</h${level}>`;
  },

  paragraph: (text: string, options: { muted?: boolean; small?: boolean } = {}) => {
    const color = options.muted ? brandColors.textLight : brandColors.text;
    const size = options.small ? '13px' : '15px';
    return `<p style="margin: 0 0 16px; font-size: ${size}; color: ${color}; line-height: 1.6;">${text}</p>`;
  },

  divider: () => `<hr style="margin: 24px 0; border: none; border-top: 1px solid ${brandColors.border};">`,

  card: (content: string, options: { highlight?: boolean } = {}) => {
    const bg = options.highlight ? '#f0fdf4' : brandColors.background;
    const border = options.highlight ? brandColors.primary : brandColors.border;
    return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td style="background: ${bg}; border: 1px solid ${border}; border-radius: 8px; padding: 20px;">
          ${content}
        </td>
      </tr>
    </table>
    `;
  },

  badge: (text: string, variant: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const colors = {
      success: { bg: '#dcfce7', text: '#166534' },
      warning: { bg: '#fef3c7', text: '#92400e' },
      error: { bg: '#fee2e2', text: '#991b1b' },
      info: { bg: '#e0f2fe', text: '#075985' },
    };
    return `<span style="display: inline-block; background: ${colors[variant].bg}; color: ${colors[variant].text}; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600;">${text}</span>`;
  },

  orderTable: (items: Array<{ name: string; quantity: number; price: number; image?: string }>, total: number) => {
    const rows = items.map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${brandColors.border};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              ${item.image ? `
              <td width="60" style="padding-right: 12px;">
                <img src="${item.image}" alt="${item.name}" width="60" height="60" style="border-radius: 8px; object-fit: cover;">
              </td>
              ` : ''}
              <td>
                <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: ${brandColors.secondary};">${item.name}</p>
                <p style="margin: 0; font-size: 13px; color: ${brandColors.textLight};">Qty: ${item.quantity}</p>
              </td>
              <td align="right" style="font-size: 14px; font-weight: 600; color: ${brandColors.secondary};">
                $${(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('');

    return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 16px 0;">
      ${rows}
      <tr>
        <td style="padding: 16px 0 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="font-size: 16px; font-weight: 700; color: ${brandColors.secondary};">Total</td>
              <td align="right" style="font-size: 20px; font-weight: 700; color: ${brandColors.primary};">$${total.toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `;
  },

  infoRow: (label: string, value: string) => `
    <tr>
      <td style="padding: 8px 0; font-size: 14px; color: ${brandColors.textLight};">${label}</td>
      <td align="right" style="padding: 8px 0; font-size: 14px; font-weight: 600; color: ${brandColors.secondary};">${value}</td>
    </tr>
  `,
};
