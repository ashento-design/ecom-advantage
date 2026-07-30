import { emailShell, button, getResendClient, FROM_ADDRESS } from '@/app/lib/email'

// Onboarding drip, day 8 — upgrade push for free-plan users only.
//
// Quotes $29/mo (billed monthly) with the $19/mo annual-equivalent —
// matches the real numbers on the account/pricing page and what Stripe
// checkout actually charges, so keep these two numbers in sync with
// PricingSection if either ever changes.
export async function sendOnboardingDay8Email(to: string, name: string, analysesUsed: number, dashboardUrl: string) {
  const resend = getResendClient()
  const firstName = name?.split(' ')[0] || 'there'
  const remaining = Math.max(0, 3 - analysesUsed)

  const html = emailShell(`
    <h1 style="color:#ffffff; font-size:20px; margin:0 0 12px 0;">Your free analyses are running out ⚡</h1>
    <p style="margin:0 0 16px 0;">
      Hey ${firstName}, you've used ${analysesUsed} of your 3 free AI analyses${remaining > 0 ? ` &mdash; ${remaining} left` : ''}. Here's what Pro unlocks:
    </p>
    <ul style="margin:0 0 20px 0; padding-left:20px;">
      <li style="margin-bottom:6px;">Unlimited AI product analyses</li>
      <li style="margin-bottom:6px;">Full product feed access, not just today's highlights</li>
      <li style="margin-bottom:6px;">Unlimited AI ad creative generation</li>
      <li style="margin-bottom:6px;">Store Intelligence &mdash; see what competitors are really making</li>
      <li style="margin-bottom:0;">Breakout alerts &amp; priority support</li>
    </ul>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0; background-color:#1f2937; border-radius:12px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; color:#818cf8; font-size:22px; font-weight:800;">$29<span style="font-size:13px; color:#9ca3af; font-weight:500;">/mo</span></p>
          <p style="margin:2px 0 0 0; color:#9ca3af; font-size:12px;">Or $19/mo billed annually &mdash; save $120/year.</p>
        </td>
      </tr>
    </table>
    ${button('Upgrade to Pro', `${dashboardUrl}/account`)}
  `)

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Your free analyses are running out ⚡',
    html,
  })
}
