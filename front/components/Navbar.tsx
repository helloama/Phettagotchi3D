import React from 'react'
import Image from 'next/image'
import { Github, Twitter, Gamepad2 } from 'lucide-react'
import Link from 'next/link'

export default function Navbar() {
  return (
    <section className="w-full py-4">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/40 blur-xl rounded-full scale-125" />
            <Image
              src="/PhettagotchiLogo.png"
              alt="Phettagotchi Logo"
              width={55}
              height={55}
              className="relative transition-transform duration-300 hover:scale-110 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
            />
          </div>
          <Link href="/" className="group">
            <h2 className="text-2xl md:text-3xl font-bold leading-none select-none font-['Orbitron'] tracking-wide">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-cyan-300 transition-all duration-300">
                Phettagotchi
              </span>
              <span className="text-slate-400 text-lg md:text-xl">.3D</span>
            </h2>
          </Link>
        </div>

        {/* Navigation Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          <Link
            href="/"
            className="phetta-panel px-4 py-2 flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
          >
            <Gamepad2 className="h-4 w-4" />
            <span className="font-['VT323'] text-lg">Games</span>
          </Link>

          {/* Social Icons */}
          <div className="flex items-center space-x-1 ml-4">
            <a
              href="https://discord.gg/kPhgtj49U2"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#5865F2]/20 hover:bg-[#5865F2]/40 border border-[#5865F2]/30 transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                className="h-5 w-5 fill-[#5865F2]"
              >
                <path d="M524.5 69.8a1.5 1.5 0 0 0 -.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0 -1.9 .9 337.5 337.5 0 0 0 -14.9 30.6 447.8 447.8 0 0 0 -134.4 0 309.5 309.5 0 0 0 -15.1-30.6 1.9 1.9 0 0 0 -1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0 -.8 .7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.9 1.9 0 0 0 -1-2.6 321.2 321.2 0 0 1 -45.9-21.9 1.9 1.9 0 0 1 -.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9 .2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1 -.2 3.1 301.4 301.4 0 0 1 -45.9 21.8 1.9 1.9 0 0 0 -1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1 .7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2S193.1 219.1 222.5 219.1c29.7 0 53.3 26.8 52.8 59.2C275.3 311 251.9 337.6 222.5 337.6zm195.4 0c-29 0-52.8-26.6-52.8-59.2S388.4 219.1 417.9 219.1c29.7 0 53.3 26.8 52.8 59.2C470.7 311 447.5 337.6 417.9 337.6z" />
              </svg>
            </a>
            <a
              href="https://twitter.com/iErcan_"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/40 border border-sky-500/30 transition-all duration-200"
            >
              <Twitter className="h-5 w-5 text-sky-400" />
            </a>
            <a
              href="https://github.com/iErcann/Notblox"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-500/20 hover:bg-slate-500/40 border border-slate-500/30 transition-all duration-200"
            >
              <Github className="h-5 w-5 text-slate-300" />
            </a>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          <a
            href="https://discord.gg/kPhgtj49U2"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 512"
              className="h-5 w-5 fill-[#5865F2]"
            >
              <path d="M524.5 69.8a1.5 1.5 0 0 0 -.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0 -1.9 .9 337.5 337.5 0 0 0 -14.9 30.6 447.8 447.8 0 0 0 -134.4 0 309.5 309.5 0 0 0 -15.1-30.6 1.9 1.9 0 0 0 -1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0 -.8 .7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.9 1.9 0 0 0 -1-2.6 321.2 321.2 0 0 1 -45.9-21.9 1.9 1.9 0 0 1 -.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9 .2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1 -.2 3.1 301.4 301.4 0 0 1 -45.9 21.8 1.9 1.9 0 0 0 -1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1 .7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2S193.1 219.1 222.5 219.1c29.7 0 53.3 26.8 52.8 59.2C275.3 311 251.9 337.6 222.5 337.6zm195.4 0c-29 0-52.8-26.6-52.8-59.2S388.4 219.1 417.9 219.1c29.7 0 53.3 26.8 52.8 59.2C470.7 311 447.5 337.6 417.9 337.6z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
