import { Outlet, Link, useLocation } from 'react-router-dom';

export default function ToolLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-300 font-sans">
      <header className="sticky top-0 z-50 bg-slate-900/85 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link to="/" className="text-lg font-bold text-slate-100 hover:text-sky-400 transition-colors">
            Ops <span className="text-sky-400">Toolbox</span>
          </Link>
          {!isHome && (
            <Link
              to="/"
              className="text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md border border-slate-700 transition-all"
            >
              ← All Tools
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800/50 py-6 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">100% Client-Side Processing</p>
        <p className="text-sm text-slate-400">Data never leaves your browser.</p>
      </footer>
    </div>
  );
}
