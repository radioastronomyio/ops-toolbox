import { Link } from 'react-router-dom';
import { getCategories, getToolsByCategory } from '../lib/toolRegistry';

export default function DirectoryGrid() {
  const categories = getCategories();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tool Directory</h1>
        <p className="text-slate-400">
          Self-hosted, client-side utilities for IT operations. Pick a tool to get started.
        </p>
      </div>
      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getToolsByCategory(category).map((tool) => {
              const showBadges = tool.processingMode !== 'local' || tool.status !== 'stable';
              return (
                <Link
                  to={tool.path}
                  key={tool.path}
                  className="block bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-sky-500 hover:-translate-y-0.5 transition-all group"
                >
                  <h3 className="text-lg font-semibold text-slate-100 group-hover:text-sky-400 transition-colors mb-1">
                    {tool.name}
                  </h3>
                  {showBadges && (
                    <div className="flex gap-1.5 mb-1.5">
                      {tool.processingMode === 'remote' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-900/40 text-amber-400 border border-amber-700/50">
                          Online
                        </span>
                      )}
                      {tool.processingMode === 'hybrid' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-900/40 text-blue-400 border border-blue-700/50">
                          Online Optional
                        </span>
                      )}
                      {tool.status === 'beta' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-900/40 text-purple-400 border border-purple-700/50">
                          Beta
                        </span>
                      )}
                      {tool.status === 'experimental' && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-900/40 text-red-400 border border-red-700/50">
                          Experimental
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-slate-400 leading-relaxed">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
