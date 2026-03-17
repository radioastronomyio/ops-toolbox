/**
 * @file ToolLayout.jsx
 * @description Main app shell with sticky header, settings flyout, content outlet, and privacy footer
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useDensity } from '../hooks/useDensity';
import { useFontFamily } from '../hooks/useFontFamily';
import SettingsFlyout from './SettingsFlyout';

export default function ToolLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const theme = useTheme();
  const density = useDensity();
  const fontFamily = useFontFamily();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text-secondary font-sans">
      <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link to="/" className="text-lg font-bold text-text-primary hover:text-accent transition-micro">
            Ops <span className="text-accent">Toolbox</span>
          </Link>
          <div className="flex items-center gap-2">
            {!isHome && (
              <Link
                to="/"
                className="text-sm text-text-secondary hover:text-text-primary bg-surface-2 hover:bg-surface-3 px-3 py-1.5 rounded-md border border-border transition-micro"
              >
                ← All Tools
              </Link>
            )}
            <SettingsFlyout theme={theme} density={density} fontFamily={fontFamily} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border-subtle py-6 text-center">
        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">100% Client-Side Processing</p>
        <p className="text-sm text-text-secondary">Data never leaves your browser.</p>
      </footer>
    </div>
  );
}
