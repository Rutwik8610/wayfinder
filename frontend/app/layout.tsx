import { Analytics } from '@vercel/analytics/next'
import { Noto_Sans_Devanagari, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import { cookies } from 'next/headers'
import type { Metadata, Viewport } from 'next'
import { AppSettingsProvider, type Language, type Theme } from '@/components/providers/app-settings-provider'
import { AuthProvider } from '../components/auth/auth-provider'
import { RequireAuth } from '../components/auth/require-auth'
import { FloatingAssistant } from '@/components/assistant/floating-assistant'
import english from '../messages/en.json'
import hindi from '../messages/hi.json'
import './globals.css'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  variable: '--font-devanagari',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const language = (await cookies()).get('wayfinder-language')?.value
  return {
    title: language === 'hi' ? hindi['app.title'] : english['app.title'],
    description: 'Explore destinations, plan personalized trips, and connect with travelers worldwide using AI-powered recommendations.',
    generator: 'v0.app',
    icons: {
      icon: [
        { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
        { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-icon.png',
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#059669' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get('wayfinder-language')?.value
  const themeCookie = cookieStore.get('wayfinder-theme')?.value
  const language: Language = languageCookie === 'hi' ? 'hi' : 'en'
  const theme: Theme = themeCookie === 'light' || themeCookie === 'dark' ? themeCookie : 'system'

  return (
    <html lang={language} className={`${theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : ''} bg-background`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(()=>{try{const c=document.cookie.split('; ').find(x=>x.startsWith('wayfinder-theme='))?.split('=')[1];const t=localStorage.getItem('wayfinder-theme')||decodeURIComponent(c||'system');const dark=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);document.documentElement.classList.toggle('light',!dark);const l=localStorage.getItem('wayfinder-language')||decodeURIComponent(document.cookie.split('; ').find(x=>x.startsWith('wayfinder-language='))?.split('=')[1]||'en');document.documentElement.lang=l==='hi'?'hi':'en'}catch{}})()` }} />
      </head>
      <body className={`${sans.variable} ${serif.variable} ${devanagari.variable} font-sans antialiased`}>
        <AppSettingsProvider initialLanguage={language} initialTheme={theme}>
          <AuthProvider>
            <RequireAuth>
              {children}
              <FloatingAssistant />
            </RequireAuth>
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </AuthProvider>
        </AppSettingsProvider>
      </body>
    </html>
  )
}
