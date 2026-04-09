export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span>Doblas 1015, C.A.B.A.</span>
            <span className="hidden sm:inline">|</span>
            <span>(011) 4922 1640</span>
            <span className="hidden sm:inline">|</span>
            <span>info@polarmax.com.ar</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Polarmax</p>
        </div>
      </div>
    </footer>
  );
}
