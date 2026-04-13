'use client';

export default function Header() {
  return (
    <header className="bg-green-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
            <span className="text-white font-bold text-base">P</span>
          </div>
          <div className="flex items-baseline gap-0">
            <span className="text-lg font-bold tracking-tight">polar</span>
            <span className="text-lg font-bold tracking-tight text-green-400">max</span>
          </div>
        </div>
        <nav className="flex items-center gap-5 text-sm">
          <span className="text-white font-medium">Cotizador</span>
          <a
            href="https://wa.me/5491141645696"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white"
          >
            Contacto
          </a>
        </nav>
      </div>
    </header>
  );
}
