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
import { getMermaidConfig } from './config';
import './styles.css';

// Register ELK before initialization
mermaid.registerLayoutLoaders(elkLayouts);

const initialTheme = localStorage.getItem('mermaid-theme') || 'dark';
const initialLayout = localStorage.getItem('mermaid-layout') || 'elk';

mermaid.initialize(getMermaidConfig(initialTheme, initialLayout));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
