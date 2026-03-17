/**
 * @file NotFound.jsx
 * @description 404 page that displays random tool suggestions to guide users back
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { Link, useLocation } from 'react-router-dom';
import { toolRegistry } from '../lib/toolRegistry';

export default function NotFound() {
  const location = useLocation();

  // Fisher-Yates-ish shuffle to surface random tool suggestions on each visit
  const suggestions = [...toolRegistry]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-text-muted mb-4">404</h1>
      <h2 className="text-xl font-semibold text-text-primary mb-2">Tool Not Found</h2>
      <p className="text-text-secondary mb-8">
        Nothing lives at <code className="text-accent bg-surface-2 px-2 py-0.5 rounded">{location.pathname}</code>
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-2 bg-accent text-black rounded-md hover:bg-accent-hover transition-micro mb-8"
      >
        Back to Tool Directory
      </Link>
      <div className="text-sm text-text-muted">
        <p className="mb-3">Or try one of these:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map(tool => (
            <Link
              key={tool.path}
              to={`/${tool.path}`}
              className="px-3 py-1 bg-surface-2 border border-border rounded text-text-secondary hover:border-accent hover:text-accent transition-micro"
            >
              {tool.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
