export default function Home() {
  return (
    <main className="relative flex h-[100dvh] w-full flex-col justify-between overflow-hidden bg-[#fffaf0] p-6 sm:p-10 md:p-12 lg:p-16 text-[#563e3b] select-none">
      {/* Subtle Ambient Sunlight Glow (Top Corner) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#ffaf37]/15 blur-3xl"
      />

      {/* Top Bar / Editorial Header */}
      <header className="relative z-10 flex w-full items-center justify-between">
        {/* Left: Status / Brand */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ffaf37] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ffaf37]" />
          </span>
          <span className="text-xs sm:text-sm font-medium tracking-widest uppercase text-[#563e3b]/80">
            Portfolio / 2026
          </span>
        </div>

        {/* Center: Editorial Tagline (visible on tablet/desktop) */}
        <div className="hidden sm:block text-xs uppercase tracking-[0.2em] text-[#563e3b]/60">
          Design & Software
        </div>

        {/* Right: Button adhering to design.md button-secondary */}
        <div>
          <a
            href="mailto:contact@dheeraj.dev"
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#563e3b]/25 bg-transparent px-5 text-xs sm:text-sm font-medium text-[#563e3b] transition-all hover:border-[#ffaf37] hover:bg-[#ffaf37] hover:text-[#563e3b] active:scale-95"
          >
            Get in touch
          </a>
        </div>
      </header>

      {/* Center Display: The Name "dheeraj" */}
      <section className="relative z-10 my-auto flex flex-col items-center justify-center text-center px-2">
        <div className="relative inline-block">
          <h1 className="font-[family-name:var(--font-serif)] text-[clamp(4.2rem,16vw,14rem)] font-normal italic leading-none tracking-[-0.03em] text-[#563e3b]">
            DHEERAJ
          </h1>

          {/* Singular Citrus Accent Dot (Casa di Solare signature touch) */}
          <span
            className="absolute -top-1 -right-2 sm:-top-2 sm:-right-4 h-2.5 w-2.5 sm:h-4 sm:w-4 rounded-full bg-[#ffaf37]"
            title="Casa di Solare accent"
          />
        </div>

        <p className="mt-4 sm:mt-6 max-w-sm sm:max-w-md text-xs sm:text-sm md:text-base font-normal leading-relaxed text-[#563e3b]/70">
          Crafting calm, thoughtful digital experiences and scalable software solutions.
        </p>
      </section>

      {/* Bottom Bar / Footer */}
      <footer className="relative z-10 flex w-full items-center justify-between text-xs sm:text-sm text-[#563e3b]/70">
        {/* Left: Availability */}
        <div className="flex items-center gap-1.5">
          <span>Available for select opportunities</span>
        </div>

        {/* Center: System Edition (hidden on mobile) */}
        <div className="hidden md:block text-[11px] uppercase tracking-widest text-[#563e3b]/40">
          Casa di Solare
        </div>

        {/* Right: Editorial links */}
        <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#563e3b]/80 transition hover:text-[#ffaf37]"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#563e3b]/80 transition hover:text-[#ffaf37]"
          >
            LinkedIn
          </a>
          <a
            href="mailto:contact@dheeraj.dev"
            className="text-[#563e3b]/80 transition hover:text-[#ffaf37]"
          >
            Email
          </a>
        </nav>
      </footer>
    </main>
  );
}
