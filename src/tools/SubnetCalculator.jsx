/**
 * @file SubnetCalculator.jsx
 * @description IPv4 subnet calculator with interactive binary-tree splitting and joining
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { useState, useCallback } from 'react';
import {
  createRootNode, splitSubnet, joinSubnet, flattenTree,
  getSubnetInfo, uint32ToIp,
} from '../lib/subnet.js';

// Color palette for visual subnet differentiation; cycles back to null after last color
const PALETTE = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#a855f7', '#14b8a6', '#6b7280'];

/** Immutably update a node in the binary tree by following a path of [0,1] child indices */
function updateNodeByPath(tree, path, updater) {
  if (path.length === 0) return updater(tree);
  const [head, ...rest] = path;
  const newChildren = [...tree.children];
  newChildren[head] = updateNodeByPath(newChildren[head], rest, updater);
  return { ...tree, children: newChildren };
}

/** DFS to find the path (array of 0/1 indices) to a leaf node matching network/prefix */
function findPathToLeaf(tree, targetNetwork, targetPrefix, path = []) {
  if (tree.network === targetNetwork && tree.prefix === targetPrefix && !tree.children) {
    return path;
  }
  if (!tree.children) return null;
  const left = findPathToLeaf(tree.children[0], targetNetwork, targetPrefix, [...path, 0]);
  if (left) return left;
  return findPathToLeaf(tree.children[1], targetNetwork, targetPrefix, [...path, 1]);
}

/** DFS to find path to any node (leaf or parent) matching network/prefix */
function findPathToNode(tree, targetNetwork, targetPrefix, path = []) {
  if (tree.network === targetNetwork && tree.prefix === targetPrefix) return path;
  if (!tree.children) return null;
  const left = findPathToNode(tree.children[0], targetNetwork, targetPrefix, [...path, 0]);
  if (left) return left;
  return findPathToNode(tree.children[1], targetNetwork, targetPrefix, [...path, 1]);
}

export default function SubnetCalculator() {
  const [networkInput, setNetworkInput] = useState('10.0.0.0');
  const [prefixInput, setPrefixInput] = useState('16');
  const [tree, setTree] = useState(() => createRootNode('10.0.0.0/16'));
  const [inputError, setInputError] = useState(null);

  const handleGo = () => {
    const node = createRootNode(`${networkInput}/${prefixInput}`);
    if (!node) {
      setInputError('Invalid network/prefix');
      return;
    }
    setInputError(null);
    setTree(node);
  };

  const handleSplit = useCallback((node) => {
    const path = findPathToLeaf(tree, node.network, node.prefix);
    if (!path) return;
    setTree(prev => updateNodeByPath(prev, path, n => splitSubnet(n) || n));
  }, [tree]);

  const handleJoin = useCallback((node) => {
    const path = findPathToNode(tree, node.network, node.prefix);
    if (!path) return;
    setTree(prev => updateNodeByPath(prev, path, n => joinSubnet(n)));
  }, [tree]);

  const handleNoteChange = useCallback((node, note) => {
    const path = findPathToLeaf(tree, node.network, node.prefix);
    if (!path) return;
    setTree(prev => updateNodeByPath(prev, path, n => ({ ...n, note })));
  }, [tree]);

  const handleColorCycle = useCallback((node) => {
    const path = findPathToLeaf(tree, node.network, node.prefix);
    if (!path) return;
    setTree(prev => updateNodeByPath(prev, path, n => {
      const idx = PALETTE.indexOf(n.color);
      const nextColor = idx === -1 ? PALETTE[0] : (idx + 1 < PALETTE.length ? PALETTE[idx + 1] : null);
      return { ...n, color: nextColor };
    }));
  }, [tree]);

  // Find parent node whose both children are leaves — only those pairs can be joined back
  function getJoinableParent(node) {
    function search(t) {
      if (!t.children) return null;
      const [a, b] = t.children;
      if (
        !a.children && !b.children &&
        ((a.network === node.network && a.prefix === node.prefix) ||
         (b.network === node.network && b.prefix === node.prefix))
      ) return t;
      return search(a) || search(b);
    }
    return search(tree);
  }

  const leaves = tree ? flattenTree(tree) : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Subnet Calculator</h1>
        <p className="text-text-secondary">Visual IPv4 subnet designer — split and join subnets interactively.</p>
      </div>

      {/* Network input */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-text-secondary mb-1">Network Address</label>
          <input
            type="text"
            value={networkInput}
            onChange={e => setNetworkInput(e.target.value)}
            className="bg-surface-1 border border-border-subtle text-text-primary rounded-md px-3 py-2 font-mono w-40"
            placeholder="10.0.0.0"
          />
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">/ Prefix</label>
          <input
            type="number"
            min="0" max="32"
            value={prefixInput}
            onChange={e => setPrefixInput(e.target.value)}
            className="bg-surface-1 border border-border-subtle text-text-primary rounded-md px-3 py-2 w-20"
          />
        </div>
        <button
          onClick={handleGo}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-black rounded-md font-medium"
        >
          Go
        </button>
        {inputError && <span className="text-status-error text-sm">{inputError}</span>}
      </div>

      {/* Subnet table */}
      {tree && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-text-secondary border-collapse">
            <thead>
              <tr className="bg-surface-1 text-xs text-text-secondary uppercase">
                <th className="px-2 py-2 text-left w-6"></th>
                <th className="px-3 py-2 text-left">Subnet Address</th>
                <th className="px-3 py-2 text-left">Range of Addresses</th>
                <th className="px-3 py-2 text-left">Usable IPs</th>
                <th className="px-3 py-2 text-right">Hosts</th>
                <th className="px-3 py-2 text-left">Note</th>
                <th className="px-3 py-2 text-center">Split/Join</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((node) => {
                const info = getSubnetInfo(node.network, node.prefix);
                const parent = getJoinableParent(node);
                return (
                  <tr
                    key={`${node.network}-${node.prefix}`}
                    className="border-b border-border hover:bg-surface-1/50"
                    style={node.color ? { borderLeft: `4px solid ${node.color}` } : {}}
                  >
                    <td className="px-2 py-2">
                      <button
                        onClick={() => handleColorCycle(node)}
                        title="Cycle color"
                        className="w-4 h-4 rounded-full border border-border-subtle"
                        style={{ backgroundColor: node.color || '#334155' }}
                      />
                    </td>
                    <td className="px-3 py-2 font-mono whitespace-nowrap">
                      {info.networkStr}/{node.prefix}
                    </td>
                    <td className="px-3 py-2 font-mono whitespace-nowrap text-xs">
                      {info.networkStr} – {info.broadcastStr}
                    </td>
                    <td className="px-3 py-2 font-mono whitespace-nowrap text-xs">
                      {node.prefix <= 30
                        ? `${info.firstHostStr} – ${info.lastHostStr}`
                        : info.firstHostStr}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{info.hosts.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={node.note}
                        onChange={e => handleNoteChange(node, e.target.value)}
                        placeholder="Add note…"
                        className="bg-transparent border-b border-border-subtle text-text-secondary text-xs px-1 py-0.5 w-full focus:outline-none focus:border-accent"
                      />
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {node.prefix < 32 && (
                        <button
                          onClick={() => handleSplit(node)}
                          className="px-2 py-1 text-xs bg-surface-2 hover:bg-surface-3 text-text-secondary rounded mr-1"
                        >
                          Split
                        </button>
                      )}
                      {parent && (
                        <button
                          onClick={() => handleJoin(parent)}
                          className="px-2 py-1 text-xs bg-surface-2 hover:bg-surface-3 text-text-secondary rounded"
                        >
                          Join
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
