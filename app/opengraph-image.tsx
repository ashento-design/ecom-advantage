import { ImageResponse } from 'next/og'

export const alt = 'Launchory — Find Winning Products Faster'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030712',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
          <div
            style={{
              width: 84,
              height: 84,
              background: '#4f46e5',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 46,
            }}
          >
            🚀
          </div>
          <div style={{ fontSize: 64, fontWeight: 700 }}>Launchory</div>
        </div>
        <div style={{ fontSize: 30, color: '#9ca3af' }}>Find Winning Products Before Your Competitors</div>
      </div>
    ),
    { ...size }
  )
}
