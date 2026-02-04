// components/GameContent.tsx
'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import GamePlayer from '@/components/GamePlayer'
import { GameInfo } from '@/types'
import gameData from '../public/gameData.json'
import { MiniGameCard } from './GameCard'
import Navbar from './Navbar'

export default function GameContent({ gameInfo }: { gameInfo: GameInfo }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playerName, setPlayerName] = useState<string>('')

  // Load player name from localStorage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem('playerName')
    if (savedName) {
      setPlayerName(savedName)
    }
  }, [])

  const handlePlayClick = () => {
    // Save player name to localStorage
    if (playerName.trim()) {
      localStorage.setItem('playerName', playerName.trim())
    }
    setIsPlaying(true)
  }

  return (
    <>
      {isPlaying ? (
        <GamePlayer {...gameInfo} playerName={playerName} />
      ) : (
        <div className="px-4 container mx-auto">
          <Navbar />
          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            {/* Image Section - Phettagotchi Panel Style */}
            <div className="lg:w-2/3 cursor-pointer" onClick={handlePlayClick}>
              <div className="phetta-panel overflow-hidden group">
                {/* Window Title Bar */}
                <div className="phetta-titlebar">
                  <span className="flex items-center gap-2">
                    <span className="text-pink-400">🎮</span>
                    <span>game_viewer.exe</span>
                  </span>
                  <div className="phetta-titlebar-dots">
                    <div className="phetta-titlebar-dot" />
                    <div className="phetta-titlebar-dot" />
                    <div className="phetta-titlebar-dot" />
                  </div>
                </div>

                <div className="relative">
                  <img
                    src={gameInfo.imageUrl}
                    alt={`${gameInfo.title} cover`}
                    className="w-full h-64 md:h-[400px] object-cover transform transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Online Badge */}
                  <div className="absolute top-4 left-4 phetta-badge-online">
                    Online
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />

                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30">
                    <div className="bg-purple-600/80 rounded-full p-6 backdrop-blur-sm border-2 border-purple-400/50 shadow-[0_0_40px_rgba(139,92,246,0.6)]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-14 w-14 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section - Phettagotchi Panel Style */}
            <div className="lg:w-1/3 flex flex-col justify-center">
              <div className="phetta-panel p-0">
                {/* Window Title Bar */}
                <div className="phetta-titlebar">
                  <span className="flex items-center gap-2">
                    <span className="text-cyan-400">⚙️</span>
                    <span>quick_play.exe</span>
                  </span>
                  <div className="phetta-titlebar-dots">
                    <div className="phetta-titlebar-dot" />
                    <div className="phetta-titlebar-dot" />
                    <div className="phetta-titlebar-dot" />
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white font-['Orbitron'] tracking-wide">
                    {gameInfo.title}
                  </h1>
                  <p className="text-slate-400 text-lg leading-relaxed font-['VT323'] text-xl">
                    {gameInfo.metaDescription}
                  </p>

                  {/* Player Name Input */}
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="playerName" className="text-sm font-medium text-purple-300 font-['VT323'] text-lg tracking-wide">
                      👤 Your Player Name
                    </label>
                    <input
                      type="text"
                      id="playerName"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name..."
                      maxLength={20}
                      className="phetta-input"
                    />
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={handlePlayClick}
                    className="phetta-btn w-full text-lg py-4"
                  >
                    ▶ Play Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Games */}
          <section className="w-full">
            <div className="phetta-panel mb-8">
              <div className="phetta-titlebar">
                <span className="flex items-center gap-2">
                  <span className="text-orange-400">📁</span>
                  <span>more_games.exe</span>
                </span>
                <div className="phetta-titlebar-dots">
                  <div className="phetta-titlebar-dot" />
                  <div className="phetta-titlebar-dot" />
                  <div className="phetta-titlebar-dot" />
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Orbitron']">More Games</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {gameData.map((game) => (
                    <MiniGameCard {...game} key={game.slug} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Markdown Content */}
          <section className="w-full mt-8 mb-12">
            <div className="phetta-panel">
              <div className="phetta-titlebar">
                <span className="flex items-center gap-2">
                  <span className="text-green-400">📄</span>
                  <span>readme.txt</span>
                </span>
                <div className="phetta-titlebar-dots">
                  <div className="phetta-titlebar-dot" />
                  <div className="phetta-titlebar-dot" />
                  <div className="phetta-titlebar-dot" />
                </div>
              </div>
              <div className="p-6">
                <div className="prose prose-invert max-w-none prose-headings:font-['Orbitron'] prose-headings:text-purple-300 prose-p:text-slate-300 prose-p:font-['VT323'] prose-p:text-lg prose-a:text-cyan-400 prose-strong:text-white">
                  <ReactMarkdown>{gameInfo.markdown}</ReactMarkdown>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
