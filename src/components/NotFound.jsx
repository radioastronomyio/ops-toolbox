import { Link, useLocation } from 'react-router-dom';
import { toolRegistry } from '../lib/toolRegistry';

export default function NotFound() {
  const location = useLocation();

  // Pick 3 random tools as suggestions
  const suggestions = [...toolRegistry]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-bold text-slate-600 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-slate-300 mb-2">Tool Not Found</h2>
      <p className="text-slate-400 mb-8">
        Nothing lives at <code className="text-sky-400 bg-slate-800 px-2 py-0.5 rounded">{location.pathname}</code>
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition-colors mb-8"
      >
        Back to Tool Directory
      </Link>
      <div className="text-sm text-slate-500">
        <p className="mb-3">Or try one of these:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map(tool => (
            <Link
              key={tool.path}
              to={`/${tool.path}`}
              className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 hover:border-sky-500 hover:text-sky-400 transition-colors"
            >
              {tool.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
