'use client';

export default function Header() {
  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Polarmax</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <span className="text-foreground font-medium">Cotizador</span>
          <a
            href="https://wa.me/5491141645696"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Contacto
          </a>
        </nav>
      </div>
    </header>
  );
}
