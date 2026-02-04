// Card components available if needed
// import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface GameCardProps {
  title: string
  imageUrl: string
  slug: string
  metaDescription: string
}

export default function GameCard({ title, imageUrl, slug, metaDescription }: GameCardProps) {
  return (
    <a
      href={`/play/${slug}`}
      className="block group transition-transform duration-200 hover:scale-[1.02] h-full"
    >
      {/* Phettagotchi Window Panel Style */}
      <div className="phetta-panel h-full overflow-hidden">
        {/* Window Title Bar */}
        <div className="phetta-titlebar">
          <span className="flex items-center gap-2">
            <span className="text-pink-400">🎮</span>
            <span>{title.toLowerCase()}.exe</span>
          </span>
          <div className="phetta-titlebar-dots">
            <div className="phetta-titlebar-dot" />
            <div className="phetta-titlebar-dot" />
            <div className="phetta-titlebar-dot" />
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {/* Image container */}
          <div className="relative w-full h-64 lg:h-80">
            <img
              alt={title}
              src={imageUrl}
              className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />

            {/* Online badge */}
            <div className="absolute top-4 left-4 phetta-badge-online">
              Online
            </div>

            {/* Play overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30">
              <div className="bg-purple-600/80 rounded-full p-4 backdrop-blur-sm border-2 border-purple-400/50 shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card Info */}
          <div className="p-4 space-y-2">
            <h3 className="text-xl font-bold text-white font-['Orbitron'] tracking-wide">{title}</h3>
            <p className="line-clamp-2 text-sm text-slate-400 leading-relaxed font-['VT323'] text-lg">
              {metaDescription}
            </p>
          </div>
        </div>
      </div>
    </a>
  )
}

/**
 * A compact version of the GameCard component for use in sidebars, related games sections,
 * or any other UI element where space is limited.
 */
export function MiniGameCard({ title, imageUrl, slug, metaDescription }: GameCardProps) {
  return (
    <a
      href={`/play/${slug}`}
      className="block group transition-transform duration-200 hover:scale-[1.02] h-full"
    >
      <div className="phetta-panel h-full overflow-hidden">
        {/* Mini Title Bar */}
        <div className="phetta-titlebar py-1 px-2">
          <span className="text-sm flex items-center gap-1">
            <span className="text-pink-400 text-xs">🎮</span>
            <span className="truncate">{title.toLowerCase()}.exe</span>
          </span>
          <div className="phetta-titlebar-dots">
            <div className="phetta-titlebar-dot w-2 h-2" />
            <div className="phetta-titlebar-dot w-2 h-2" />
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full h-40 lg:h-56">
          <img
            alt={title}
            src={imageUrl}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />

          {/* Online badge */}
          <div className="absolute top-2 left-2 phetta-badge-online text-xs py-1 px-2">
            Online
          </div>
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
          <h3 className="text-base font-bold text-white font-['Orbitron'] truncate">{title}</h3>
          <p className="line-clamp-1 text-slate-400 font-['VT323'] text-base">
            {metaDescription}
          </p>
        </div>
      </div>
    </a>
  )
}

/**
 * A micro version of the GameCard component for use in compact UI elements
 * where minimal space is available.
 */
export function MicroGameCard({ title, imageUrl, slug }: Omit<GameCardProps, 'metaDescription'>) {
  return (
    <a
      href={`/play/${slug}`}
      className="block group transition-transform duration-200 hover:scale-[1.05]"
    >
      <div className="relative overflow-hidden rounded-lg border-2 border-purple-900/50 hover:border-purple-500/50 transition-all duration-200 bg-[#0a0a1a]">
        <div className="relative w-full h-12 aspect-square">
          <img
            alt={title}
            src={imageUrl}
            className="h-full w-full object-cover brightness-90 group-hover:brightness-110 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-transparent" />
          <span className="absolute bottom-1 left-1 text-xs text-white truncate w-5/6 font-['VT323']">
            {title}
          </span>
        </div>
      </div>
    </a>
  )
}
