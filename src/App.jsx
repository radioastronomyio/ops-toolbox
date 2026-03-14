import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ToolLayout from './components/ToolLayout';
import DirectoryGrid from './components/DirectoryGrid';

// Lazy-loaded tool routes
const SubnetCalculator = lazy(() => import('./tools/SubnetCalculator'));
const JwtDecoder = lazy(() => import('./tools/JwtDecoder'));
const PasswordGenerator = lazy(() => import('./tools/PasswordGenerator'));
const JsonYamlConverter = lazy(() => import('./tools/JsonYamlConverter'));
const Base64Codec = lazy(() => import('./tools/Base64Codec'));
// MermaidRenderer added in spec 06
const MermaidRenderer = lazy(() => import('./tools/mermaid-renderer/MermaidRenderer'));

export const toolsConfig = [
  {
    name: 'Subnet Calculator',
    desc: 'IPv4 CIDR arithmetic — network, broadcast, host range, and mask calculations.',
    path: 'subnet-calculator',
    category: 'Networking',
    component: SubnetCalculator,
  },
  {
    name: 'JWT Decoder',
    desc: 'Inspect JSON Web Token headers and payload claims without exposing secrets.',
    path: 'jwt-decoder',
    category: 'Security',
    component: JwtDecoder,
  },
  {
    name: 'Password Generator',
    desc: 'Cryptographically secure string generation using Web Crypto API entropy.',
    path: 'password-generator',
    category: 'Security',
    component: PasswordGenerator,
  },
  {
    name: 'JSON ↔ YAML',
    desc: 'Bidirectional conversion between JSON and YAML with real-time linting.',
    path: 'json-yaml',
    category: 'Data',
    component: JsonYamlConverter,
  },
  {
    name: 'Base64 Codec',
    desc: 'Encode and decode Base64 strings with support for UTF-8 and binary data.',
    path: 'base64',
    category: 'Data',
    component: Base64Codec,
  },
  {
    name: 'Mermaid Renderer',
    desc: 'Paste mermaid diagram code and get rendered SVG with ELK layout engine.',
    path: 'mermaid-renderer',
    category: 'Developer',
    component: MermaidRenderer,
  },
];

function Loading() {
  return (
    <div className="flex items-center justify-center h-64 text-slate-500">
      Loading tool…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ToolLayout />}>
          <Route index element={<DirectoryGrid />} />
          {toolsConfig.map((tool) => (
            <Route
              key={tool.path}
              path={tool.path}
              element={
                <Suspense fallback={<Loading />}>
                  <tool.component />
                </Suspense>
              }
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
