export default function Footer() {
  return (
    <footer className="mt-auto bg-green-900 text-white/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
            <span>Doblas 1015, C.A.B.A.</span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span>(011) 4922 1640</span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span>info@polarmax.com.ar</span>
          </div>
          <p className="text-white/40">&copy; {new Date().getFullYear()} Polarmax</p>
        </div>
      </div>
    </footer>
  );
}
