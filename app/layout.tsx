import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegister from './components/service-worker-register'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-cormorant',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Habit Museum',
  description: 'A private museum of personal discipline.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Habit Museum',
  },
}

export const viewport: Viewport = {
  themeColor: '#3D2B1A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body style={{ background: 'var(--bg-primary)' }}>
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto',
            minHeight: '100dvh',
            background: 'var(--bg-primary)',
            position: 'relative',
          }}
        >
          {children}
        </div>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
