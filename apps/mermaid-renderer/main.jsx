/**
 * @file main.jsx
 * @description React entry point with mermaid and ELK layout engine initialization
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import elkLayouts from '@mermaid-js/layout-elk';
import mermaid from 'mermaid';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Register ELK before initialization
mermaid.registerLayoutLoaders(elkLayouts);

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'antiscript', // Allows HTML labels while blocking script execution
  layout: 'elk',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
  },
  elk: {
    mergeEdges: true,
    nodePlacementStrategy: 'SIMPLE',
    cycleBreakingStrategy: 'GREEDY',
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
