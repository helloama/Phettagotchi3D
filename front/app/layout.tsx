import '@/styles/globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Phettagotchi 3D - Play multiplayer games in your browser',
  description: 'Play multiplayer games in your browser. Raise your virtual pet and compete with friends.',
}

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050510] text-slate-100 antialiased">
        {/* Animated stars background */}
        <div className="phetta-stars" />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  )
}
