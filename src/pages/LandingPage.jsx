import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Landing page for "Sathanius’ Class Optimizer"
// Style: Arcane Library (warm candlelit ambience), left-aligned, mystical + modern
// Tech: React + TailwindCSS + Framer Motion + React Router (Link)
// Usage: place in src/pages/LandingPage.jsx and route it at "/".

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0f0c12] text-[#F2E9D8] overflow-hidden">
      {/* --- Background layers: warm library ambience using layered gradients --- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 600px at 15% 20%, rgba(212,180,131,0.08), transparent 60%),"
              + "radial-gradient(900px 500px at 80% 10%, rgba(136,161,103,0.06), transparent 55%),"
              + "radial-gradient(1200px 700px at 50% 90%, rgba(255,210,150,0.05), transparent 60%),"
              + "linear-gradient(180deg, #1C1423 0%, #0D0A0F 100%)",
            filter: "saturate(1.05)",
          }}
        />
        {/* soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.55))]" />
      </div>

      {/* --- Floating whisper sigils (very subtle) --- */}
      <WhisperSigils />

      {/* --- Minimal Header: only small sigil logo centered at top --- */}
      <header className="relative z-10 flex items-center justify-center pt-8">
        <ArcaneSigil className="h-8 w-8 text-[#D4B483] opacity-70" />
      </header>

      {/* --- HERO --- */}
      <main className="relative z-10">
        <section className="mx-auto max-w-5xl px-6 sm:px-8 md:px-10 lg:px-12 pt-16 pb-20">
          <div className="md:max-w-3xl">
            {/* left margin illuminated line */}
            <div className="mb-6 h-10 w-[2px] bg-gradient-to-b from-[#D4B483] to-transparent opacity-70" />

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-[500] tracking-[0.01em] text-3xl sm:text-5xl leading-tight text-[#F7F1E8] font-['Cormorant_Garamond',serif]"
            >
              Sathanius’ Class Optimizer
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
              className="mt-4 text-lg sm:text-xl text-[#E9DFCE]/90 font-['Inter',system-ui,sans-serif]"
            >
              A quiet revelation for those who seek their true form.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              className="mt-8"
            >
              <Link
                to="/dnd-class-optimizer"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#D4B483]/40 bg-[#1C1423]/60 px-5 py-3 text-base sm:text-lg font-medium text-[#F2E9D8] shadow-[0_0_0_1px_rgba(212,180,131,0.15)_inset] hover:bg-[#1C1423]/80 hover:border-[#D4B483]/60 transition"
              >
                Let us begin
                <span aria-hidden>→</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* --- FEATURES: Modern alternating layout --- */}
        <section className="relative border-t border-white/5 bg-[#100d14]/60">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 md:px-10 lg:px-12 py-16">
            <Feature
              title="Class Resonance Analysis"
              body="Your strengths, inclinations, and combat temperament are mapped to archetypes to reveal where your spirit aligns."
              Icon={ResonanceIcon}
              align="left"
            />

            <Feature
              title="Ability Score Tools"
              body="Roll the bones, choose the standard array, or weave destiny through precise point buy — all within one calm interface."
              Icon={DiceIcon}
              align="right"
            />

            <Feature
              title="Build Suggestions"
              body="Early-level guidance with feats, styles, and background synergies — offered as gentle counsel, never command."
              Icon={QuillIcon}
              align="left"
            />

            <Feature
              title="Compatible with 2024 SRD"
              body="Forged in respect of the ancient rules — free for seekers, safe for creators."
              Icon={SealIcon}
              align="right"
            />
          </div>
        </section>

        {/* --- HOW IT WORKS: Arcane Rite --- */}
        <section className="relative border-t border-white/5">
          <div className="mx-auto max-w-5xl px-6 sm:px-8 md:px-10 lg:px-12 py-16">
            <h2 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl text-[#F7F1E8] mb-8">How it works</h2>
            <ol className="space-y-6 text-[#E9DFCE]/90 font-['Inter',system-ui,sans-serif]">
              <li>
                <StepTitle>Attune to Your Essence</StepTitle>
                <StepBody>
                  Speak your ability scores into the tome — whether rolled by chance, chosen with care, or shaped through point buy.
                </StepBody>
              </li>
              <li>
                <StepTitle>Let the Resonance Stir</StepTitle>
                <StepBody>
                  The optimizer measures your strengths and threads them through the ancient patterns of class archetypes.
                </StepBody>
              </li>
              <li>
                <StepTitle>Witness the Unveiling</StepTitle>
                <StepBody>
                  A class will call to you — not as command, but as recognition.
                </StepBody>
              </li>
              <li>
                <StepTitle>Choose to Accept or Defy</StepTitle>
                <StepBody>
                  Follow the suggested path… or write a new stanza in your legend. Both are true to you.
                </StepBody>
              </li>
            </ol>
          </div>
        </section>

        {/* --- LORE NOTE: Fey Charm --- */}
        <section className="relative border-t border-white/5 bg-[#100d14]/60">
          <div className="mx-auto max-w-4xl px-6 sm:px-8 md:px-10 lg:px-12 py-16">
            <blockquote className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl text-[#F7F1E8]/95 leading-relaxed">
              <p>
                “Names have power. Choices even more so. Do not fret — your path has never been hidden from you. It has only waited for you to look.
                Come — let us turn these pages together. I will not lead, nor follow. We will simply walk. And in the quiet between breaths… you will recognize yourself.”
              </p>
            </blockquote>
            <p className="mt-4 text-right text-[#D4B483] font-['Inter',system-ui,sans-serif]">— Sathanius, Archivist of the Verdant Veil</p>
          </div>
        </section>

        {/* --- FINAL CALL --- */}
        <section className="relative border-t border-white/5">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 md:px-10 lg:px-12 py-16 text-center">
            <p className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl text-[#F7F1E8]/95 mb-8">“I already know you're ready.”</p>
            <Link
              to="/dnd-class-optimizer"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#D4B483]/40 bg-[#1C1423]/60 px-5 py-3 text-base sm:text-lg font-medium text-[#F2E9D8] shadow-[0_0_0_1px_rgba(212,180,131,0.15)_inset] hover:bg-[#1C1423]/80 hover:border-[#D4B483]/60 transition"
            >
              Let us begin <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* --- Footer (minimal) --- */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-sm text-[#CFC6B5]/70">
        <p>
          © {new Date().getFullYear()} Sathanius’ Class Optimizer — Compatible with 2024 SRD rules. Not affiliated with Wizards of the Coast.
        </p>
      </footer>
    </div>
  );
}

/* ----------------- Small Components ----------------- */
function StepTitle({ children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-[1px] w-6 bg-[#D4B483]/60" />
      <h3 className="font-['Cormorant_Garamond',serif] text-xl text-[#F7F1E8]">{children}</h3>
    </div>
  );
}
function StepBody({ children }) {
  return <p className="ml-9 mt-2 text-base text-[#E9DFCE]/85">{children}</p>;
}

function Feature({ title, body, Icon, align = "left" }) {
  const isLeft = align === "left";
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center py-10 ${isLeft ? "" : "md:[&>*:first-child]:order-2"}`}>
      <div className="relative">
        <div className="absolute -left-4 -top-4 h-10 w-10 rounded-full bg-[#D4B483]/10 blur-xl" aria-hidden />
        <Icon className="h-10 w-10 text-[#D4B483] opacity-80" />
        <h3 className="mt-4 font-['Cormorant_Garamond',serif] text-2xl text-[#F7F1E8]">{title}</h3>
        <p className="mt-2 text-[#E9DFCE]/85 font-['Inter',system-ui,sans-serif]">{body}</p>
      </div>
      <div className="min-h-[120px] md:min-h-[160px] rounded-2xl border border-white/5 bg-black/10 backdrop-blur-[1px] p-6">
        <div className="h-full w-full rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent" />
      </div>
    </div>
  );
}

/* ----------------- Icons (line art) ----------------- */
function ResonanceIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className}>
      <circle cx="12" cy="12" r="7" opacity=".9" />
      <path d="M12 5v14M5 12h14" opacity=".7" />
      <circle cx="12" cy="12" r="3.5" opacity=".6" />
    </svg>
  );
}
function DiceIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className}>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <circle cx="12" cy="8" r=".8" />
      <circle cx="8.5" cy="10.5" r=".8" />
      <circle cx="15.5" cy="10.5" r=".8" />
      <circle cx="12" cy="14" r=".8" />
    </svg>
  );
}
function QuillIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className}>
      <path d="M4 20c9 0 12-6 12-15 2 1 3 3 3 5-1 7-6 10-15 10z" />
      <path d="M7 19c.5-2 2-4 4-5" opacity=".7" />
    </svg>
  );
}
function SealIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={className}>
      <circle cx="12" cy="12" r="7" />
      <path d="M8 12h8M12 8v8" opacity=".7" />
    </svg>
  );
}

function ArcaneSigil({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" className={className}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 4v16M4 12h16" opacity=".7" />
      <path d="M7 7l10 10M7 17L17 7" opacity=".5" />
    </svg>
  );
}

/* ----------------- Whisper Sigils ----------------- */
function WhisperSigils() {
  const items = [
    { top: "20%", left: "8%", size: 140, delay: 0 },
    { top: "65%", left: "80%", size: 110, delay: 2.7 },
    { top: "35%", left: "60%", size: 160, delay: 1.4 },
  ];
  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      {items.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05, rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear", delay: p.delay }}
          className="absolute"
          style={{ top: p.top, left: p.left }}
        >
          <div style={{ width: p.size, height: p.size }}>
            <ArcaneSigil className="text-[#D4B483] w-full h-full" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
