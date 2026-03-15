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
const CidrExpander = lazy(() => import('./tools/CidrExpander'));
const MacVendorLookup = lazy(() => import('./tools/MacVendorLookup'));
const UrlParser = lazy(() => import('./tools/UrlParser'));
const UserAgentDecoder = lazy(() => import('./tools/UserAgentDecoder'));
const ChmodCalculator = lazy(() => import('./tools/ChmodCalculator'));
const SshKeyGenerator = lazy(() => import('./tools/SshKeyGenerator'));
const X509Parser = lazy(() => import('./tools/X509Parser'));
const FileHashCalculator = lazy(() => import('./tools/FileHashCalculator'));
const BcryptHashVerifier = lazy(() => import('./tools/BcryptHashVerifier'));
const JsonDiff = lazy(() => import('./tools/JsonDiff'));
const CsvToJson = lazy(() => import('./tools/CsvToJson'));
const SqlFormatter = lazy(() => import('./tools/SqlFormatter'));
const UrlQueryEncoder = lazy(() => import('./tools/UrlQueryEncoder'));
const CronParser = lazy(() => import('./tools/CronParser'));
const RegexTester = lazy(() => import('./tools/RegexTester'));
const AsciiBanner = lazy(() => import('./tools/AsciiBanner'));
const UuidGenerator = lazy(() => import('./tools/UuidGenerator'));
const UnixEpochTool = lazy(() => import('./tools/UnixEpochTool'));
const MarkdownPreviewer = lazy(() => import('./tools/MarkdownPreviewer'));

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
  {
    name: 'CIDR Expander',
    desc: 'Expand a CIDR block into its full IP range with enumeration for small subnets.',
    path: 'cidr-expander',
    category: 'Networking',
    component: CidrExpander,
  },
  {
    name: 'MAC Vendor Lookup',
    desc: 'Look up the manufacturer for a MAC address via OUI prefix.',
    path: 'mac-lookup',
    category: 'Networking',
    component: MacVendorLookup,
  },
  {
    name: 'URL Parser',
    desc: 'Parse any URL into its component parts: protocol, host, path, params, and hash.',
    path: 'url-parser',
    category: 'Developer',
    component: UrlParser,
  },
  {
    name: 'User-Agent Decoder',
    desc: 'Parse browser User-Agent strings into browser, OS, device, and engine components.',
    path: 'useragent-decoder',
    category: 'Developer',
    component: UserAgentDecoder,
  },
  {
    name: 'Chmod Calculator',
    desc: 'Bidirectional Unix permission converter: octal ↔ symbolic with interactive checkbox grid.',
    path: 'chmod-calculator',
    category: 'Developer',
    component: ChmodCalculator,
  },
  {
    name: 'SSH Keypair Generator',
    desc: 'Generate RSA SSH keypairs in-browser using node-forge. Private key stays on your device.',
    path: 'ssh-keygen',
    category: 'Security',
    component: SshKeyGenerator,
  },
  {
    name: 'X.509 Parser',
    desc: 'Parse PEM certificates: subject, issuer, validity, key info, and extensions.',
    path: 'x509-parser',
    category: 'Security',
    component: X509Parser,
  },
  {
    name: 'File Hash Calculator',
    desc: 'Compute MD5, SHA-1, SHA-256, SHA-512 digests for any file. All processing in-browser.',
    path: 'file-hash-calculator',
    category: 'Security',
    component: FileHashCalculator,
  },
  {
    name: 'Bcrypt Verifier',
    desc: 'Hash strings with bcrypt and verify passwords against stored hashes. Client-side only.',
    path: 'bcrypt-hash-verifier',
    category: 'Security',
    component: BcryptHashVerifier,
  },
  {
    name: 'JSON Diff',
    desc: 'Side-by-side JSON diff with color-coded additions, deletions, and modifications.',
    path: 'json-diff',
    category: 'Data',
    component: JsonDiff,
  },
  {
    name: 'CSV to JSON',
    desc: 'Convert CSV files or pasted text to formatted JSON with PapaParse.',
    path: 'csv-to-json',
    category: 'Data',
    component: CsvToJson,
  },
  {
    name: 'SQL Formatter',
    desc: 'Pretty-print SQL queries with dialect support: PostgreSQL, MySQL, T-SQL, BigQuery.',
    path: 'sql-formatter',
    category: 'Data',
    component: SqlFormatter,
  },
  {
    name: 'URL Encoder',
    desc: 'Encode/decode URL components, parse full URLs, and build query strings.',
    path: 'url-encoder',
    category: 'Developer',
    component: UrlQueryEncoder,
  },
  {
    name: 'Cron Parser',
    desc: 'Translate cron expressions to human descriptions and preview next run times.',
    path: 'cron-parser',
    category: 'Developer',
    component: CronParser,
  },
  {
    name: 'Regex Tester',
    desc: 'Test regular expressions with live match highlighting and capture group display.',
    path: 'regex-tester',
    category: 'Developer',
    component: RegexTester,
  },
  {
    name: 'ASCII Banner',
    desc: 'Generate terminal-style ASCII art banners from text with figlet fonts.',
    path: 'ascii-banner',
    category: 'Developer',
    component: AsciiBanner,
  },
  {
    name: 'UUID Generator',
    desc: 'Generate cryptographically secure UUID v4 and v7 with bulk and format options.',
    path: 'uuid-generator',
    category: 'Developer',
    component: UuidGenerator,
  },
  {
    name: 'Unix Epoch',
    desc: 'Convert Unix timestamps to human dates and vice versa, with live counter.',
    path: 'epoch-time',
    category: 'Developer',
    component: UnixEpochTool,
  },
  {
    name: 'Markdown Previewer',
    desc: 'Live Markdown editor with GFM support and XSS-safe HTML preview via DOMPurify.',
    path: 'markdown-previewer',
    category: 'Developer',
    component: MarkdownPreviewer,
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
