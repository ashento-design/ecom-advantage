import { emailShell, button, getResendClient, FROM_ADDRESS } from '@/app/lib/email'

// Onboarding drip, day 4 — educational, positions Launchory as the answer,
// with a soft (non-pushy) mention of Pro rather than a hard upgrade CTA.
export async function sendOnboardingDay4Email(to: string, name: string, dashboardUrl: string) {
  const resend = getResendClient()
  const firstName = name?.split(' ')[0] || 'there'

  const html = emailShell(`
    <h1 style="color:#ffffff; font-size:20px; margin:0 0 12px 0;">How top dropshippers find winning products in 2026</h1>
    <p style="margin:0 0 16px 0;">Hey ${firstName}, the dropshippers who consistently find winners aren't guessing &mdash; they're watching the right signals:</p>
    <ul style="margin:0 0 16px 0; padding-left:20px;">
      <li style="margin-bottom:8px;"><strong style="color:#ffffff;">View velocity</strong>, not total views &mdash; a product going from 2k to 15k views in a day beats one sitting flat at 50k.</li>
      <li style="margin-bottom:8px;"><strong style="color:#ffffff;">Supplier order volume</strong> &mdash; a spike in orders or reviews on the source listing is harder to fake than viral content.</li>
      <li style="margin-bottom:8px;"><strong style="color:#ffffff;">Competition level</strong> &mdash; a good product with low competition usually beats a great product ten other stores are already running ads for.</li>
      <li style="margin-bottom:0;"><strong style="color:#ffffff;">A daily habit</strong> &mdash; ten minutes a day checking a curated feed beats one big research sprint a month.</li>
    </ul>
    <p style="margin:0 0 16px 0;">
      This is exactly the gap Launchory closes &mdash; instead of manually tracking all of that yourself, you get a demand score, competition read, and ad angles for any product in seconds.
    </p>
    ${button("Browse Today's Feed", dashboardUrl)}
    <p style="margin:20px 0 0 0; color:#6b7280; font-size:13px;">
      If you find yourself reaching for more than the free analyses, Pro unlocks unlimited AI analyses and the full feed.
    </p>
  `)

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'How top dropshippers find winning products in 2026',
    html,
  })
}
