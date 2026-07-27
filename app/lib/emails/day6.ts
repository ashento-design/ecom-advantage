import { emailShell, button, escapeHtml, getResendClient, FROM_ADDRESS } from '@/app/lib/email'
import type { FeedProductSummary } from '@/app/lib/emails/day2'

// Onboarding drip, day 6 — social proof from the live feed, then a nudge
// toward the ad generator.
export async function sendOnboardingDay6Email(to: string, name: string, products: FeedProductSummary[], dashboardUrl: string) {
  const resend = getResendClient()
  const firstName = name?.split(' ')[0] || 'there'

  const rows = products.map((p) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px; background-color:#1f2937; border-radius:12px; overflow:hidden;">
      <tr>
        <td style="width:72px; padding:10px;">
          <img src="${p.image_url}" width="56" height="56" alt="${escapeHtml(p.title)}" style="border-radius:8px; object-fit:cover; display:block;" />
        </td>
        <td style="padding:10px 14px 10px 0; vertical-align:middle;">
          <p style="margin:0 0 2px 0; color:#ffffff; font-size:13px; font-weight:600;">${escapeHtml(p.title)}</p>
          <p style="margin:0; color:#818cf8; font-size:12px; font-weight:600;">Demand score: ${p.demand_score}</p>
        </td>
      </tr>
    </table>
  `).join('')

  const html = emailShell(`
    <h1 style="color:#ffffff; font-size:20px; margin:0 0 4px 0;">What dropshippers are finding with Launchory</h1>
    <p style="margin:0 0 16px 0;">Hey ${firstName}, here are a few products currently standing out in the feed:</p>
    ${rows}
    <p style="margin:16px 0 16px 0;">
      Once something looks worth testing, Launchory's <strong style="color:#ffffff;">Ad Generator</strong> can turn it into a ready-to-run creative &mdash; pick an angle, a format, and a style, and get a polished ad image in under 30 seconds.
    </p>
    ${button('Generate an Ad', dashboardUrl)}
  `)

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'What dropshippers are finding with Launchory',
    html,
  })
}
