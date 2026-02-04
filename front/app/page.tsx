import GameCard from '@/components/GameCard'
import KeyboardLayout from '@/components/KeyboardLayout'
import Navbar from '@/components/Navbar'
import { Github, Twitter, Gamepad2 } from 'lucide-react'
import Link from 'next/link'
import { GameInfo } from '../types'
import gameData from '../public/gameData.json'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Phettagotchi 3D - Play multiplayer games in your browser',
    description:
      'Play multiplayer games in your browser. Raise your virtual pet and compete with friends in the Phettagotchi universe.',
    openGraph: {
      title: 'Phettagotchi 3D - Play multiplayer games in your browser',
      description:
        'Play multiplayer games in your browser. Raise your virtual pet and compete with friends.',
      images: ['/PreviewTestGame.webp'],
      siteName: 'Phettagotchi 3D',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@em0tionull',
      creator: '@em0tionull',
    },
  }
}

export default async function Home() {
  const games = gameData as GameInfo[]
  return (
    <div className="space-y-8 flex flex-col items-center px-4 container pb-12">
      <Navbar />

      {/* Hero Section */}
      <div className="phetta-panel w-full max-w-4xl p-0">
        <div className="phetta-titlebar">
          <span className="flex items-center gap-2">
            <span className="text-pink-400">✨</span>
            <span>welcome_home.exe</span>
          </span>
          <div className="phetta-titlebar-dots">
            <div className="phetta-titlebar-dot" />
            <div className="phetta-titlebar-dot" />
            <div className="phetta-titlebar-dot" />
          </div>
        </div>
        <div className="p-8 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-['Orbitron']">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Phettagotchi
            </span>
            <span className="text-slate-400">.3D</span>
          </h1>
          <p className="text-slate-400 font-['VT323'] text-2xl max-w-2xl mx-auto">
            Play multiplayer games in your browser. Raise your virtual pet and compete with friends in the Phettagotchi universe.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <div className="phetta-stat">
              <div className="phetta-stat-label">Games</div>
              <div className="phetta-stat-value text-green-400">{games.length}</div>
            </div>
            <div className="phetta-stat">
              <div className="phetta-stat-label">Status</div>
              <div className="phetta-stat-value text-green-400">Online</div>
            </div>
            <div className="phetta-stat">
              <div className="phetta-stat-label">Version</div>
              <div className="phetta-stat-value text-cyan-400">1.0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="w-full">
        <div className="phetta-panel p-0 mb-6">
          <div className="phetta-titlebar">
            <span className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-green-400" />
              <span>game_browser.exe</span>
            </span>
            <div className="phetta-titlebar-dots">
              <div className="phetta-titlebar-dot" />
              <div className="phetta-titlebar-dot" />
              <div className="phetta-titlebar-dot" />
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white font-['Orbitron'] mb-6">Available Games</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {games &&
                games.map((game, index) => (
                  <div
                    className={`col-span-1 ${
                      // Only make the last item span full width when total count is odd
                      index === games.length - 1 && games.length % 2 !== 0 ? 'md:col-span-2' : ''
                    }`}
                    key={index}
                  >
                    <GameCard {...game} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Layout */}
      <KeyboardLayout />

      {/* Social Links */}
      <div className="phetta-panel p-0 w-full max-w-3xl">
        <div className="phetta-titlebar">
          <span className="flex items-center gap-2">
            <span className="text-cyan-400">🔗</span>
            <span>social_links.exe</span>
          </span>
          <div className="phetta-titlebar-dots">
            <div className="phetta-titlebar-dot" />
            <div className="phetta-titlebar-dot" />
            <div className="phetta-titlebar-dot" />
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              href={'https://discord.gg/c68KnzNvUm'}
              className="flex py-3 items-center justify-center px-6 font-['VT323'] text-xl bg-[#5865F2]/20 hover:bg-[#5865F2]/40 border border-[#5865F2]/50 rounded-lg transition-all duration-200 text-[#5865F2]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                className="h-5 w-5 mr-2 fill-current"
              >
                <path d="M524.5 69.8a1.5 1.5 0 0 0 -.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0 -1.9 .9 337.5 337.5 0 0 0 -14.9 30.6 447.8 447.8 0 0 0 -134.4 0 309.5 309.5 0 0 0 -15.1-30.6 1.9 1.9 0 0 0 -1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0 -.8 .7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.9 1.9 0 0 0 -1-2.6 321.2 321.2 0 0 1 -45.9-21.9 1.9 1.9 0 0 1 -.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9 .2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1 -.2 3.1 301.4 301.4 0 0 1 -45.9 21.8 1.9 1.9 0 0 0 -1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1 .7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2S193.1 219.1 222.5 219.1c29.7 0 53.3 26.8 52.8 59.2C275.3 311 251.9 337.6 222.5 337.6zm195.4 0c-29 0-52.8-26.6-52.8-59.2S388.4 219.1 417.9 219.1c29.7 0 53.3 26.8 52.8 59.2C470.7 311 447.5 337.6 417.9 337.6z" />
              </svg>
              Discord
            </Link>
            <Link
              href={'https://x.com/em0tionull'}
              className="flex py-3 items-center justify-center px-6 font-['VT323'] text-xl bg-sky-500/20 hover:bg-sky-500/40 border border-sky-500/50 rounded-lg transition-all duration-200 text-sky-400"
            >
              <Twitter className="mr-2 h-5 w-5" />
              Twitter
            </Link>
            <Link
              href={'https://3d.phetta.lol/'}
              className="flex py-3 items-center justify-center px-6 font-['VT323'] text-xl bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/50 rounded-lg transition-all duration-200 text-purple-300"
            >
              <Gamepad2 className="mr-2 h-5 w-5" />
              Phettagotchi
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
