'use client'

import { useEffect } from 'react'
import { captureReferralCode } from '@/app/lib/referral'

export function ReferralCapture() {
  useEffect(() => {
    captureReferralCode()
  }, [])
  return null
}
