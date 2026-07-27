import { emailShell, button, escapeHtml, getResendClient, FROM_ADDRESS } from '@/app/lib/email'

export type FeedProductSummary = { id: string; title: string; image_url: string; demand_score: number }

// Onboarding drip, day 2 — sent only if the user hasn't run an analysis yet.
export async function sendOnboardingDay2Email(to: string, name: string, product: FeedProductSummary, dashboardUrl: string) {
  const resend = getResendClient()
  const firstName = name?.split(' ')[0] || 'there'

  const html = emailShell(`
    <h1 style="color:#ffffff; font-size:20px; margin:0 0 12px 0;">Have you tried the AI Analyzer yet?</h1>
    <p style="margin:0 0 16px 0;">
      Hey ${firstName}, most winning products get found in seconds, not hours. Launchory's AI Analyzer reads a product's title and description, then hands back a demand score, competition level, suggested pricing, ad angles, and video hooks &mdash; all in about 3 seconds.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px 0; background-color:#1f2937; border-radius:12px; overflow:hidden;">
      <tr>
        <td style="width:88px; padding:12px;">
          <img src="${product.image_url}" width="72" height="72" alt="${escapeHtml(product.title)}" style="border-radius:8px; object-fit:cover; display:block;" />
        </td>
        <td style="padding:12px 16px 12px 0; vertical-align:middle;">
          <p style="margin:0 0 4px 0; color:#ffffff; font-size:14px; font-weight:600;">${escapeHtml(product.title)}</p>
          <p style="margin:0; color:#9ca3af; font-size:12px;">Demand score: <strong style="color:#818cf8;">${product.demand_score}</strong> &mdash; worth a look.</p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px 0; color:#9ca3af; font-size:13px;">
      A typical result looks like: <em>Demand 87/100 &middot; Competition: Medium &middot; Suggested price $24.99&ndash;$39.99 &middot; 3 ready-to-use ad angles.</em>
    </p>
    ${button('Analyze This Product', `${dashboardUrl}/products/${product.id}`)}
  `)

  return resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Have you tried the AI Analyzer yet?',
    html,
  })
}
