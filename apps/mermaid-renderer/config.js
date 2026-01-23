/**
 * @file config.js
 * @description Centralized mermaid configuration factory
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

/**
 * Generates mermaid configuration based on theme and layout
 * @param {string} theme - 'dark' | 'light'
 * @param {string} layout - 'elk' | 'dagre'
 * @returns {import('mermaid').MermaidConfig}
 */
export const getMermaidConfig = (theme, layout) => {
  const config = {
    startOnLoad: false,
    theme: theme === 'dark' ? 'dark' : 'default',
    securityLevel: 'antiscript',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: layout === 'elk' ? 'linear' : 'basis',
    },
  };

  if (layout === 'elk') {
    config.layout = 'elk';
    config.elk = {
      mergeEdges: true,
      nodePlacementStrategy: 'SIMPLE',
      cycleBreakingStrategy: 'GREEDY',
    };
  } else {
    // Dagre is the default, so we don't strictly need to set layout: 'dagre'
    // but some versions of mermaid might benefit or require it if previously set to elk
    config.layout = 'dagre';
  }

  return config;
};
