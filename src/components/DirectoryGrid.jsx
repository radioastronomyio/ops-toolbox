import { Link } from 'react-router-dom';
import { toolsConfig } from '../App';

export default function DirectoryGrid() {
  // Group tools by category
  const categories = {};
  toolsConfig.forEach((tool) => {
    if (!categories[tool.category]) categories[tool.category] = [];
    categories[tool.category].push(tool);
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tool Directory</h1>
        <p className="text-slate-400">
          Self-hosted, client-side utilities for IT operations. Pick a tool to get started.
        </p>
      </div>
      {Object.entries(categories).map(([category, tools]) => (
        <div key={category} className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <Link
                to={tool.path}
                key={tool.path}
                className="block bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-sky-500 hover:-translate-y-0.5 transition-all group"
              >
                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-sky-400 transition-colors mb-1">
                  {tool.name}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
