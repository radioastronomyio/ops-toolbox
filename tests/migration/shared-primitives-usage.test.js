import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

const TOOL_DIR = resolve(__dirname, '../../src/tools');
const CLIPBOARD_EXCLUDED = ['FileHashCalculator.jsx'];

function getToolFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.jsx')) {
      files.push(join(dir, entry.name));
    } else if (entry.isDirectory()) {
      files = files.concat(getToolFiles(join(dir, entry.name)));
    }
  }
  return files;
}

describe('shared primitives adoption', () => {
  const toolFiles = getToolFiles(TOOL_DIR);

  test('no tool uses hand-rolled clipboard pattern (except excluded)', () => {
    const pattern = /setTimeout\(\s*\(\)\s*=>\s*setCopied/;
    for (const file of toolFiles) {
      const name = file.split(/[\\/]/).pop();
      if (CLIPBOARD_EXCLUDED.includes(name)) continue;
      const content = readFileSync(file, 'utf-8');
      expect(content).not.toMatch(pattern);
    }
  });

  test('no tool uses hand-rolled debounce pattern', () => {
    const pattern = /debounceRef\.current\s*=\s*setTimeout/;
    for (const file of toolFiles) {
      const content = readFileSync(file, 'utf-8');
      expect(content).not.toMatch(pattern);
    }
  });
});
