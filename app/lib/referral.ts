export const REFERRAL_CODE_KEY = 'launchory_referral_code'

export function captureReferralCode() {
  if (typeof window === 'undefined') return
  const code = new URLSearchParams(window.location.search).get('ref')
  if (code) {
    localStorage.setItem(REFERRAL_CODE_KEY, code.toUpperCase())
  }
}

export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFERRAL_CODE_KEY)
}
