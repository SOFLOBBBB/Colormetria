import { motion } from 'framer-motion'
import { Sparkles, Shirt, Lock, ScanFace, Layers } from 'lucide-react'

/* Mannequin silhouette — pure SVG, no external assets */
function MannequinSVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" aria-hidden>
      <defs>
        <radialGradient id="vtro-body-glow" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="rgba(167,139,250,0.09)" />
          <stop offset="100%" stopColor="rgba(139,92,246,0)" />
        </radialGradient>
        <linearGradient id="vtro-body-fill" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="rgba(167,139,250,0.22)" />
          <stop offset="100%" stopColor="rgba(109,40,217,0.12)" />
        </linearGradient>
      </defs>

      {/* Head */}
      <ellipse cx="50" cy="18" rx="13" ry="16"
        fill="rgba(167,139,250,0.18)" stroke="rgba(167,139,250,0.4)" strokeWidth="0.8" />
      {/* Neck */}
      <rect x="45" y="32" width="10" height="9" rx="2.5"
        fill="rgba(167,139,250,0.13)" stroke="rgba(167,139,250,0.3)" strokeWidth="0.7" />
      {/* Shoulders + arms */}
      <path d="M18 44 Q35 38 45 41 L45 82 L18 82 Q14 68 18 44Z"
        fill="url(#vtro-body-fill)" stroke="rgba(139,92,246,0.32)" strokeWidth="0.7" />
      <path d="M82 44 Q65 38 55 41 L55 82 L82 82 Q86 68 82 44Z"
        fill="url(#vtro-body-fill)" stroke="rgba(139,92,246,0.32)" strokeWidth="0.7" />
      {/* Torso */}
      <path d="M30 41 Q50 33 70 41 L74 108 Q50 116 26 108Z"
        fill="url(#vtro-body-fill)" stroke="rgba(139,92,246,0.28)" strokeWidth="0.8" />
      {/* Hips */}
      <path d="M26 108 Q50 118 74 108 L80 158 Q50 168 20 158Z"
        fill="rgba(109,40,217,0.11)" stroke="rgba(139,92,246,0.22)" strokeWidth="0.7" />
      {/* Legs */}
      <rect x="28" y="156" width="16" height="36" rx="5"
        fill="rgba(109,40,217,0.09)" stroke="rgba(139,92,246,0.2)" strokeWidth="0.7" />
      <rect x="56" y="156" width="16" height="36" rx="5"
        fill="rgba(109,40,217,0.09)" stroke="rgba(139,92,246,0.2)" strokeWidth="0.7" />
      {/* Ambient glow overlay */}
      <ellipse cx="50" cy="100" rx="44" ry="68" fill="url(#vtro-body-glow)" />
      {/* Scan line */}
      <line x1="10" y1="90" x2="90" y2="90"
        stroke="rgba(167,139,250,0.28)" strokeWidth="0.8" strokeDasharray="4 3" />
    </svg>
  )
}

/* Subtle clothing preview sketches */
function OutlineShirt({ style }) {
  return (
    <svg viewBox="0 0 48 40" className="w-full h-full" style={style} aria-hidden>
      <path d="M4 10 L12 4 L20 10 L24 6 L28 10 L36 4 L44 10 L40 18 L36 14 L36 36 L12 36 L12 14 L8 18Z"
        fill="rgba(139,92,246,0.1)" stroke="rgba(167,139,250,0.35)" strokeWidth="1.2"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function OutlinePants({ style }) {
  return (
    <svg viewBox="0 0 40 44" className="w-full h-full" style={style} aria-hidden>
      <path d="M4 4 L36 4 L34 24 L28 24 L24 44 L16 44 L12 24 L6 24Z"
        fill="rgba(109,40,217,0.1)" stroke="rgba(139,92,246,0.32)" strokeWidth="1.2"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

const FEATURES = [
  { icon: ScanFace, label: 'Análisis corporal con IA' },
  { icon: Layers,   label: 'Capas de prenda personalizadas' },
  { icon: Sparkles, label: 'Recomendaciones por estación' },
]

export default function VirtualTryOnComingSoon() {
  return (
    <motion.section
      id="seccion-virtual-tryon"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-violet-400/[0.16] bg-white/[0.025] scroll-mt-24"
      aria-label="Virtual Try-On — próximamente"
    >
      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes vtro-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes vtro-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-7px); }
        }
        @keyframes vtro-scan {
          0%,100% { opacity: 0; top: 30%; }
          10%     { opacity: 1; }
          90%     { opacity: 1; }
          50%     { top: 70%; }
        }
        .vtro-shimmer-bar {
          background: linear-gradient(
            90deg,
            rgba(167,139,250,0.04) 0%,
            rgba(167,139,250,0.14) 45%,
            rgba(255,255,255,0.08) 55%,
            rgba(167,139,250,0.04) 100%
          );
          background-size: 220% 100%;
          animation: vtro-shimmer 2.6s ease-in-out infinite;
        }
        .vtro-float { animation: vtro-float 4.2s ease-in-out infinite; }
        .vtro-scan-line {
          position: absolute; left: 8%; right: 8%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.55), transparent);
          animation: vtro-scan 3.8s ease-in-out infinite;
        }
      `}</style>

      {/* ── Background glows ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-600/[0.07] blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-fuchsia-700/[0.05] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 rounded-full bg-indigo-600/[0.04] blur-2xl" />
      </div>

      <div className="relative p-5 sm:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6 lg:gap-10 items-center">

          {/* ── Left: copy + features ── */}
          <div className="space-y-5">
            {/* Title row */}
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-xl border border-violet-400/25 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 flex items-center justify-center shrink-0"
                style={{ boxShadow: '0 0 28px rgba(139,92,246,0.22)' }}
              >
                <Shirt className="w-5 h-5 text-violet-200" aria-hidden />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h3 className="font-display text-xl sm:text-2xl text-white/95 tracking-tight">
                    Virtual Try-On
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] border border-amber-400/35 bg-amber-500/[0.1] text-amber-200/90">
                    <Sparkles className="w-3 h-3 shrink-0" aria-hidden />
                    Coming Soon
                  </span>
                </div>
                <p className="text-sm text-white/45">Disponible próximamente</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-white/65 leading-relaxed">
              Próximamente podrás probar outfits y recomendaciones visuales personalizadas
              usando IA y análisis corporal.
            </p>

            {/* Feature chips */}
            <ul className="flex flex-col gap-2" role="list">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg border border-violet-400/20 bg-violet-500/[0.1] flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-violet-300/80" aria-hidden />
                  </span>
                  <span className="text-xs text-white/50">{label}</span>
                </li>
              ))}
            </ul>

            {/* Shimmer progress bars */}
            <div className="space-y-2 py-1">
              <div className="h-1.5 w-3/4 rounded-full vtro-shimmer-bar" />
              <div className="h-1.5 w-1/2 rounded-full vtro-shimmer-bar" style={{ animationDelay: '0.5s' }} />
              <div className="h-1.5 w-2/3 rounded-full vtro-shimmer-bar" style={{ animationDelay: '1s' }} />
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 min-h-[40px] px-5 rounded-xl border border-white/[0.1] bg-white/[0.04] text-white/32 text-sm font-medium cursor-not-allowed select-none"
                aria-label="Disponible próximamente"
              >
                <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden />
                Próximamente
              </button>
              <p className="text-[11px] text-white/32 italic">
                Se notificará cuando esté listo
              </p>
            </div>
          </div>

          {/* ── Right: mannequin mockup ── */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-4">
            {/* Main mannequin */}
            <div className="relative w-28 h-52">
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 90% at 50% 60%, rgba(109,40,217,0.13) 0%, transparent 70%)' }}
                aria-hidden
              />
              <div className="vtro-float w-full h-full relative z-10">
                <MannequinSVG />
              </div>
              <div className="vtro-scan-line" aria-hidden />
            </div>

            {/* Floating clothing previews */}
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-9 opacity-60"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <OutlineShirt />
              </motion.div>
              <motion.div
                className="w-9 h-10 opacity-50"
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
              >
                <OutlinePants />
              </motion.div>
            </div>

            {/* Label under mockup */}
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 text-center">
              Vista previa conceptual
            </p>
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div
        className="h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.35), rgba(217,70,239,0.2), transparent)' }}
        aria-hidden
      />
    </motion.section>
  )
}
