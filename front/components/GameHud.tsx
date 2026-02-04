/* eslint-disable react/jsx-no-undef */
import { useEffect, useRef, useState } from 'react'
import { Joystick } from 'react-joystick-component'
import { Game } from '@/game/Game'
import Link from 'next/link'
import { SerializedMessageType } from '@shared/network/server/serialized'
import { MessageComponent } from '@shared/component/MessageComponent'
import { Maximize } from 'lucide-react'
import { MicroGameCard } from './GameCard'
import { GameInfo } from '@/types'
import gameData from '../public/gameData.json'

export interface GameHudProps {
  messages: MessageComponent[]
  sendMessage: (message: string) => void
  gameInstance: Game
}

export default function GameHud({
  messages: messageComponents,
  sendMessage,
  gameInstance,
}: GameHudProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const refContainer = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<
    Array<{ id: number; content: string; author: string; timestamp: number }>
  >([])
  const processedMessagesRef = useRef<Set<number>>(new Set())

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messageComponents])

  // Handle notifications from chat messages
  useEffect(() => {
    if (!messageComponents || messageComponents.length === 0) return

    // Process new messages for notifications
    messageComponents.forEach((messageComponent, index) => {
      const messageType = messageComponent.messageType
      const messageId = messageComponent.timestamp

      // Skip if we've already processed this message
      if (processedMessagesRef.current.has(messageId)) {
        return
      }

      // Only process global notifications
      // Check if the message is a notification type
      if (
        messageType === SerializedMessageType.GLOBAL_NOTIFICATION ||
        (messageType === SerializedMessageType.TARGETED_NOTIFICATION &&
          gameInstance?.currentPlayerEntityId &&
          messageComponent.targetPlayerIds?.includes(gameInstance?.currentPlayerEntityId))
      ) {
        // Mark as processed
        processedMessagesRef.current.add(messageId)

        // Add new notification
        const newNotification = {
          id: Date.now() + index, // Unique ID
          content: messageComponent.content,
          author: messageComponent.author,
          timestamp: Date.now(),
        }

        // Only show one at a time for now
        setNotifications([newNotification])

        // Remove notification after 5 seconds
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
        }, 5000)
      }
    })
  }, [messageComponents, gameInstance?.currentPlayerEntityId])

  const handleFullscreenClick = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  // Filter messages based on type and target
  const getFilteredMessages = () => {
    if (!messageComponents || messageComponents.length === 0) return []

    return messageComponents.filter((message) => {
      const messageType = message.messageType
      const targetPlayerIds = message.targetPlayerIds || []
      // Show global chat messages
      if (messageType === SerializedMessageType.GLOBAL_CHAT) return true

      // Show targeted chat messages if player is in target list
      if (
        messageType === SerializedMessageType.TARGETED_CHAT &&
        gameInstance?.currentPlayerEntityId
      ) {
        return targetPlayerIds.includes(gameInstance?.currentPlayerEntityId)
      }

      // Don't show notifications in chat
      if (
        messageType === SerializedMessageType.GLOBAL_NOTIFICATION ||
        messageType === SerializedMessageType.TARGETED_NOTIFICATION
      ) {
        return false
      }

      return true
    })
  }

  // Add CSS for animations

  return (
    <div
      id="hud"
      className="fixed inset-0 text-white p-4 z-50 pointer-events-none"
      ref={refContainer}
    >
      {/* Global Notifications - Phettagotchi Style */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 pointer-events-none">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="phetta-panel p-0 w-full max-w-sm shadow-[0_0_30px_rgba(139,92,246,0.4)]"
            style={{
              animation: 'bounceIn 0.4s ease-out, fadeOut 0.6s ease 4s forwards',
              transformOrigin: 'top center',
            }}
          >
            <div className="phetta-titlebar py-1">
              <span className="text-sm">📢 notification.exe</span>
            </div>
            <div className="p-4 text-center">
              <p className="font-bold font-['Orbitron'] text-purple-400 text-lg">
                {notification.author}
              </p>
              <p className="text-slate-200 font-['VT323'] text-xl">{notification.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Left Panel - Welcome */}
      <div className="flex justify-between items-start">
        <div className="phetta-panel p-0 pointer-events-auto">
          <div className="phetta-titlebar py-1 px-3">
            <span className="text-sm flex items-center gap-1">
              <span className="text-pink-400">🎮</span>
              <span>welcome.exe</span>
            </span>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-slate-400 font-['VT323'] text-lg">👋 Welcome to</p>
            <a
              className="text-xl md:text-2xl font-bold hover:text-purple-300 transition-colors font-['Orbitron']"
              href="/"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Phettagotchi
              </span>
              <span className="text-slate-400 text-lg">.3D</span>
            </a>
            <div className="pt-2">
              <Link
                href="https://discord.gg/kPhgtj49U2"
                target="_blank"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 border border-[#5865F2]/50 rounded-lg transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                  className="h-4 w-4 fill-[#5865F2]"
                >
                  <path d="M524.5 69.8a1.5 1.5 0 0 0 -.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0 -1.9 .9 337.5 337.5 0 0 0 -14.9 30.6 447.8 447.8 0 0 0 -134.4 0 309.5 309.5 0 0 0 -15.1-30.6 1.9 1.9 0 0 0 -1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0 -.8 .7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.9 1.9 0 0 0 -1-2.6 321.2 321.2 0 0 1 -45.9-21.9 1.9 1.9 0 0 1 -.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9 .2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1 -.2 3.1 301.4 301.4 0 0 1 -45.9 21.8 1.9 1.9 0 0 0 -1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1 .7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2S193.1 219.1 222.5 219.1c29.7 0 53.3 26.8 52.8 59.2C275.3 311 251.9 337.6 222.5 337.6zm195.4 0c-29 0-52.8-26.6-52.8-59.2S388.4 219.1 417.9 219.1c29.7 0 53.3 26.8 52.8 59.2C470.7 311 447.5 337.6 417.9 337.6z" />
                </svg>
                <span className="font-['VT323'] text-lg text-[#5865F2]">Join Discord</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right Panel - Chat & Games */}
      <div className="absolute bottom-4 right-4 phetta-panel p-0 z-50 hidden lg:flex flex-col w-[380px] pointer-events-auto">
        <div className="phetta-titlebar py-1 px-3">
          <span className="text-sm flex items-center gap-1">
            <span className="text-cyan-400">💬</span>
            <span>chat_panel.exe</span>
          </span>
          <div className="phetta-titlebar-dots">
            <div className="phetta-titlebar-dot w-2 h-2" />
            <div className="phetta-titlebar-dot w-2 h-2" />
          </div>
        </div>

        <div className="p-3 space-y-3">
          {/* Mini games section */}
          <div className="grid grid-cols-4 gap-2">
            {gameData.slice(0, 4).map((game: GameInfo) => (
              <MicroGameCard
                key={game.slug}
                title={game.title}
                imageUrl={game.imageUrl}
                slug={game.slug}
              />
            ))}
          </div>

          {/* Chat messages */}
          <div className="overflow-y-auto max-h-56 h-56 space-y-2 pr-2 bg-black/30 rounded-lg p-2">
            {getFilteredMessages().map((messageComponent, index) => {
              return (
                <div
                  key={index}
                  ref={index === getFilteredMessages().length - 1 ? messagesEndRef : null}
                >
                  <div
                    className={`rounded-lg p-2 ${
                      messageComponent.messageType === SerializedMessageType.TARGETED_CHAT
                        ? 'bg-purple-900/30 border border-purple-500/30'
                        : 'bg-slate-800/50 border border-slate-600/30'
                    }`}
                  >
                    <p className="text-sm break-words font-['VT323'] text-base">
                      <span
                        className={`font-bold ${
                          messageComponent.messageType === SerializedMessageType.TARGETED_CHAT
                            ? 'text-purple-400'
                            : 'text-cyan-400'
                        }`}
                      >
                        {messageComponent.author}
                      </span>
                      <span className="text-slate-300">: {messageComponent.content}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Chat input */}
          <input
            type="text"
            placeholder="Type your message..."
            className="phetta-input w-full text-sm"
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                sendMessage(e.currentTarget.value)
                e.currentTarget.value = ''
                e.currentTarget.blur() // Remove focus from the input
              }
            }}
          />
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="flex lg:hidden pointer-events-auto">
        <div className="absolute top-2 right-2">
          <button
            onClick={handleFullscreenClick}
            className="p-3 phetta-panel border-purple-500/50 hover:border-purple-400/70 transition-colors"
          >
            <Maximize className="size-8 text-purple-400" />
          </button>
        </div>
        <div className="absolute bottom-12 left-12">
          <Joystick
            size={100}
            baseColor="rgba(139, 92, 246, 0.3)"
            stickColor="rgba(139, 92, 246, 0.6)"
            move={(props) => gameInstance?.inputManager.handleJoystickMove(props)}
            stop={(props) => gameInstance?.inputManager.handleJoystickStop(props)}
          />
        </div>
        <div className="absolute bottom-12 right-12">
          <button
            className="bg-gradient-to-b from-green-500 to-green-600 text-white font-bold rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-transform transform hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] active:translate-y-1 w-24 h-24 flex items-center justify-center border-2 border-green-400/50 font-['Orbitron']"
            onTouchStart={() => gameInstance && (gameInstance.inputManager.inputState.s = true)}
            onMouseDown={() => gameInstance && (gameInstance.inputManager.inputState.s = true)}
            onTouchEnd={() => gameInstance && (gameInstance.inputManager.inputState.s = false)}
            onMouseOut={() => gameInstance && (gameInstance.inputManager.inputState.s = false)}
          >
            <span className="pointer-events-none text-sm">JUMP</span>
          </button>
        </div>
      </div>
    </div>
  )
}
