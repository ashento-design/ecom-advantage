import { Resend } from 'resend'

const FROM_ADDRESS = 'Launchory <onboarding@resend.dev>'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured on the server')
  }
  return new Resend(apiKey)
}

function emailShell(bodyHtml: string) {
  return `
<!DOCTYPE html>
<html>
  <body style="margin:0; padding:0; background-color:#030712; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#030712; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#111827; border:1px solid #1f2937; border-radius:16px; overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 0 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:32px; height:32px; background-color:#4f46e5; border-radius:8px; text-align:center; vertical-align:middle; font-size:16px;">
                      🚀
                    </td>
                    <td style="padding-left:10px; color:#ffffff; font-size:18px; font-weight:700;">
                      Launchory
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px; color:#d1d5db; font-size:14px; line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; border-top:1px solid #1f2937; color:#6b7280; font-size:12px;">
                Launchory &mdash; AI-powered product research for Shopify dropshippers.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function button(label: string, url: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background-color:#4f46e5; border-radius:10px;">
        <a href="${url}" style="display:inline-block; padding:12px 24px; color:#ffffff; font-size:14px; font-weight:600; text-decoration:none;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`
}

export async function sendWelcomeEmail(to: string, name: string, dashboardUrl: string) {
  const resend = getResendClient()
  const firstName = name?.split(' ')[0] || 'there'
  const html = emailShell(`
    <h1 style="color:#ffffff; font-size:20px; margin:0 0 12px 0;">Welcome to Launchory, ${firstName}!</h1>
    <p style="margin:0 0 16px 0;">
      You're in. Launchory finds winning Shopify products, analyzes them with AI, and helps you build ad creative &mdash; all in one place.
    </p>
    <p style="margin:0 0 16px 0;">
      You have <strong style="color:#ffffff;">3 free AI analyses</strong> to get started. Use them on the products that catch your eye in today's feed.
    </p>
    ${button('Go to Dashboard', dashboardUrl)}
    <p style="margin:16px 0 0 0; color:#6b7280; font-size:13px;">
      Questions? Just reply to this email.
    </p>
  `)

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Welcome to Launchory 🚀',
    html,
  })
}

export async function sendUpgradeConfirmationEmail(to: string, name: string, dashboardUrl: string) {
  const resend = getResendClient()
  const firstName = name?.split(' ')[0] || 'there'
  const html = emailShell(`
    <h1 style="color:#ffffff; font-size:20px; margin:0 0 12px 0;">You're on Pro, ${firstName}! 🎉</h1>
    <p style="margin:0 0 16px 0;">
      Thanks for upgrading. Your account now has:
    </p>
    <ul style="margin:0 0 16px 0; padding-left:20px;">
      <li style="margin-bottom:6px;">Unlimited AI product analyses</li>
      <li style="margin-bottom:6px;">Full product feed access</li>
      <li style="margin-bottom:6px;">Unlimited AI ad creative generation</li>
      <li style="margin-bottom:6px;">Breakout alerts &amp; priority support</li>
    </ul>
    ${button('Go to Dashboard', dashboardUrl)}
    <p style="margin:16px 0 0 0; color:#6b7280; font-size:13px;">
      You can manage your subscription anytime from your account page.
    </p>
  `)

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "You're on Launchory Pro 🎉",
    html,
  })
}

type DigestProduct = { id: string; title: string; image_url: string; demand_score: number }

export async function sendWeeklyDigestEmail(to: string, name: string, products: DigestProduct[], dashboardUrl: string) {
  const resend = getResendClient()
  const firstName = name?.split(' ')[0] || 'there'

  const rows = products.map((p) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px; background-color:#1f2937; border-radius:12px; overflow:hidden;">
      <tr>
        <td style="width:88px; padding:12px;">
          <img src="${p.image_url}" width="72" height="72" alt="${escapeHtml(p.title)}" style="border-radius:8px; object-fit:cover; display:block;" />
        </td>
        <td style="padding:12px 16px 12px 0; vertical-align:middle;">
          <p style="margin:0 0 4px 0; color:#ffffff; font-size:14px; font-weight:600;">${escapeHtml(p.title)}</p>
          <p style="margin:0 0 8px 0; color:#9ca3af; font-size:12px;">Demand score: <strong style="color:#818cf8;">${p.demand_score}</strong></p>
          <a href="${dashboardUrl}/products/${p.id}" style="display:inline-block; color:#818cf8; font-size:12px; font-weight:600; text-decoration:none;">Analyze Now &rarr;</a>
        </td>
      </tr>
    </table>
  `).join('')

  const html = emailShell(`
    <h1 style="color:#ffffff; font-size:20px; margin:0 0 4px 0;">This week&apos;s top 5 winners</h1>
    <p style="margin:0 0 20px 0;">Hey ${firstName}, here&apos;s what&apos;s trending on Launchory this week.</p>
    ${rows}
    ${button('See Full Feed', dashboardUrl)}
  `)

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "🔥 This Week's Top 5 Winning Products",
    html,
  })
}

type BreakoutProduct = { id: string; title: string; image_url: string; views: number }

export async function sendBreakoutAlertEmail(to: string, name: string, product: BreakoutProduct, dashboardUrl: string) {
  const resend = getResendClient()
  const firstName = name?.split(' ')[0] || 'there'

  const html = emailShell(`
    <h1 style="color:#ffffff; font-size:20px; margin:0 0 12px 0;">🚨 Breakout Product Alert</h1>
    <p style="margin:0 0 16px 0;">Hey ${firstName}, a product in the feed is spiking right now:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px; background-color:#1f2937; border-radius:12px; overflow:hidden;">
      <tr>
        <td style="width:96px; padding:12px;">
          <img src="${product.image_url}" width="80" height="80" alt="${escapeHtml(product.title)}" style="border-radius:8px; object-fit:cover; display:block;" />
        </td>
        <td style="padding:12px 16px 12px 0; vertical-align:middle;">
          <p style="margin:0 0 4px 0; color:#ffffff; font-size:15px; font-weight:700;">${escapeHtml(product.title)}</p>
          <p style="margin:0; color:#f97316; font-size:13px; font-weight:600;">${product.views}+ views and climbing</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px 0; color:#9ca3af; font-size:13px;">
      Products that spike like this often become winners before they get saturated. Get in early.
    </p>
    ${button('Analyze This Product', `${dashboardUrl}/products/${product.id}`)}
  `)

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: '🚨 Breakout Product Alert',
    html,
  })
}
