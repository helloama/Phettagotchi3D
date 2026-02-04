'use client'
import React, { useState, useEffect } from 'react'
import { KeyboardLanguage } from '@/game/InputManager'
import { Keyboard } from 'lucide-react'

export default function KeyboardLayout() {
  const [keyboardLayout, setKeyboardLayout] = useState(KeyboardLanguage.EN)

  useEffect(() => {
    const savedLayout = localStorage.getItem('keyboardLayout')
    if (savedLayout) {
      setKeyboardLayout(savedLayout as KeyboardLanguage)
    }
  }, [])

  const toggleKeyboardLayout = () => {
    const newLayout =
      keyboardLayout === KeyboardLanguage.EN ? KeyboardLanguage.FR : KeyboardLanguage.EN
    setKeyboardLayout(newLayout)
    localStorage.setItem('keyboardLanguage', newLayout)
  }

  const KeyCap = ({ children }: { children: React.ReactNode }) => (
    <kbd className="px-3 py-2 text-lg font-bold text-purple-300 bg-slate-800 border-2 border-purple-900/50 rounded-lg font-['Orbitron'] shadow-[0_2px_0_0_rgba(139,92,246,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-slate-700 transition-colors">
      {children}
    </kbd>
  )

  return (
    <div className="phetta-panel w-full md:w-fit p-0">
      <div className="phetta-titlebar">
        <span className="flex items-center gap-2">
          <Keyboard className="h-4 w-4 text-yellow-400" />
          <span>controls.exe</span>
        </span>
        <div className="phetta-titlebar-dots">
          <div className="phetta-titlebar-dot" />
          <div className="phetta-titlebar-dot" />
          <div className="phetta-titlebar-dot" />
        </div>
      </div>

      <div className="p-6 space-y-4 flex flex-col items-center">
        <p className="text-lg font-bold font-['Orbitron'] text-white">
          {keyboardLayout === KeyboardLanguage.EN ? 'QWERTY' : 'AZERTY'}{' '}
          <span className="text-slate-400 font-['VT323'] text-xl">
            {keyboardLayout === KeyboardLanguage.EN ? '(US)' : '(French)'}
          </span>
        </p>

        <p className="text-purple-400 font-['VT323'] text-xl">Movement Keys</p>

        <div className="flex flex-col items-center gap-2">
          <div>
            {keyboardLayout === KeyboardLanguage.EN ? <KeyCap>W</KeyCap> : <KeyCap>Z</KeyCap>}
          </div>
          <div className="flex gap-2">
            {keyboardLayout === KeyboardLanguage.EN ? (
              <>
                <KeyCap>A</KeyCap>
                <KeyCap>S</KeyCap>
                <KeyCap>D</KeyCap>
              </>
            ) : (
              <>
                <KeyCap>Q</KeyCap>
                <KeyCap>S</KeyCap>
                <KeyCap>D</KeyCap>
              </>
            )}
          </div>
        </div>

        <button
          onClick={toggleKeyboardLayout}
          className="px-6 py-2 text-sm mt-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-['Orbitron'] rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all shadow-[0_4px_15px_rgba(139,92,246,0.3)]"
        >
          Switch to {keyboardLayout === KeyboardLanguage.EN ? 'AZERTY' : 'QWERTY'}
        </button>
      </div>
    </div>
  )
}
