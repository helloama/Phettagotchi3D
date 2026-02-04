export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#050510] flex items-center justify-center">
      {/* Animated stars background */}
      <div className="phetta-stars" />

      {/* Loading Panel */}
      <div className="relative z-10 phetta-panel w-full max-w-md mx-4">
        <div className="phetta-titlebar">
          <span className="flex items-center gap-2">
            <span className="text-cyan-400">🔄</span>
            <span>loading.exe</span>
          </span>
          <div className="phetta-titlebar-dots">
            <div className="phetta-titlebar-dot" />
            <div className="phetta-titlebar-dot" />
            <div className="phetta-titlebar-dot" />
          </div>
        </div>

        <div className="p-8 space-y-6 text-center">
          {/* Logo/Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-['Orbitron']">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Phettagotchi
              </span>
              <span className="text-slate-400 text-xl">.3D</span>
            </h1>
            <p className="text-slate-400 font-['VT323'] text-xl">Connecting to server...</p>
          </div>

          {/* Loading Animation */}
          <div className="space-y-4">
            {/* Progress bar container */}
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-purple-900/50">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                style={{
                  width: '60%',
                  animation: 'loading-progress 2s ease-in-out infinite',
                }}
              />
            </div>

            {/* Loading dots */}
            <div className="flex justify-center space-x-2">
              <div
                className="w-3 h-3 bg-purple-500 rounded-full"
                style={{ animation: 'bounce 1s ease-in-out 0s infinite' }}
              />
              <div
                className="w-3 h-3 bg-pink-500 rounded-full"
                style={{ animation: 'bounce 1s ease-in-out 0.2s infinite' }}
              />
              <div
                className="w-3 h-3 bg-cyan-500 rounded-full"
                style={{ animation: 'bounce 1s ease-in-out 0.4s infinite' }}
              />
            </div>
          </div>

          {/* Status messages */}
          <div className="space-y-2 font-['VT323'] text-lg">
            <p className="text-green-400">✓ Initializing game engine...</p>
            <p className="text-yellow-400 animate-pulse">○ Establishing connection...</p>
            <p className="text-slate-500">○ Loading assets...</p>
          </div>

          {/* Button */}
          <button
            type="button"
            disabled
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-['Orbitron'] py-3 px-6 rounded-lg opacity-70 cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Please wait...
            </span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes loading-progress {
          0% {
            width: 20%;
          }
          50% {
            width: 80%;
          }
          100% {
            width: 20%;
          }
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  )
}
