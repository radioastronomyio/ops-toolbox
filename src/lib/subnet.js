/**
 * @file subnet.js
 * @description IPv4 CIDR math and interactive binary tree model for subnet splitting/joining
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

/**
 * IPv4 subnet math — pure bitwise arithmetic on 32-bit integers.
 * Supports the visual split/join subnet tree model where each node can be
 * split into two children (prefix+1) or joined back into a single block.
 * The tree is binary: splitting a /24 yields two /25s, etc.
 */

/** Convert dotted-quad string to uint32 */
export function ipToUint32(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) throw new Error('Invalid IP: must have 4 octets');
  let n = 0;
  for (let i = 0; i < 4; i++) {
    const octet = parseInt(parts[i], 10);
    if (isNaN(octet) || octet < 0 || octet > 255) throw new Error('Invalid IP: octets must be 0-255');
    n = (n << 8) | octet;
  }
  return n >>> 0; // >>> 0 coerces to unsigned 32-bit
}

/** Convert uint32 to dotted-quad string */
export function uint32ToIp(num) {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join('.');
}

/** Calculate subnet details from network (uint32) and prefix length */
export function getSubnetInfo(network, prefix) {
  // Build mask by shifting all-ones left; >>> 0 keeps it unsigned
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const networkAddr = (network & mask) >>> 0;
  const broadcast = (networkAddr | (~mask >>> 0)) >>> 0;

  // /32 = single host, /31 = point-to-point link (RFC 3021), else subtract network+broadcast
  let hosts, firstHost, lastHost;
  if (prefix === 32) {
    hosts = 1;
    firstHost = networkAddr;
    lastHost = networkAddr;
  } else if (prefix === 31) {
    hosts = 2;
    firstHost = networkAddr;
    lastHost = broadcast;
  } else {
    hosts = Math.pow(2, 32 - prefix) - 2;
    firstHost = (networkAddr + 1) >>> 0;
    lastHost = (broadcast - 1) >>> 0;
  }

  return {
    network: networkAddr,
    prefix,
    networkStr: uint32ToIp(networkAddr),
    broadcastStr: uint32ToIp(broadcast),
    firstHostStr: uint32ToIp(firstHost),
    lastHostStr: uint32ToIp(lastHost),
    netmask: uint32ToIp(mask),
    hosts,
    broadcast,
  };
}

/** Parse "10.0.0.0/16" into { network: uint32, prefix: number }, or null if invalid */
export function parseCIDR(cidr) {
  if (!cidr || typeof cidr !== 'string') return null;
  const parts = cidr.split('/');
  if (parts.length !== 2) return null;
  try {
    const network = ipToUint32(parts[0]);
    const prefix = parseInt(parts[1], 10);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) return null;
    return { network, prefix };
  } catch {
    return null;
  }
}

/** Create initial root node for the interactive subnet tree from a CIDR string */
export function createRootNode(cidr) {
  const parsed = parseCIDR(cidr);
  if (!parsed) return null;
  return {
    network: parsed.network,
    prefix: parsed.prefix,
    color: null,
    note: '',
    children: null,
  };
}

/** Split a leaf node into two equal children (prefix + 1). Returns null if prefix >= 32. */
export function splitSubnet(node) {
  if (node.prefix >= 32) return null;
  const newPrefix = node.prefix + 1;
  const halfSize = Math.pow(2, 32 - newPrefix) >>> 0;
  return {
    ...node,
    children: [
      { network: node.network, prefix: newPrefix, color: null, note: '', children: null },
      { network: (node.network + halfSize) >>> 0, prefix: newPrefix, color: null, note: '', children: null },
    ],
  };
}

/** Join a node's children back into a leaf node */
export function joinSubnet(node) {
  if (!node.children) return node;
  return { ...node, children: null };
}

/** Flatten the tree into an ordered array of leaf nodes */
export function flattenTree(node) {
  if (!node.children) return [node];
  return [...flattenTree(node.children[0]), ...flattenTree(node.children[1])];
}

/**
 * Expand a CIDR into an array of IP strings.
 * For ranges > 1024 IPs, returns { ...info, totalIPs, ips: null }
 * For ranges <= 1024, returns { ...info, totalIPs, ips: string[] }
 * Returns null for invalid CIDR.
 */
export function expandCIDR(cidr) {
  const parsed = parseCIDR(cidr);
  if (!parsed) return null;
  const info = getSubnetInfo(parsed.network, parsed.prefix);
  const totalIPs = Math.pow(2, 32 - parsed.prefix);
  if (totalIPs > 1024) return { ...info, totalIPs, ips: null };
  const ips = [];
  for (let i = 0; i < totalIPs; i++) {
    ips.push(uint32ToIp((parsed.network + i) >>> 0));
  }
  return { ...info, totalIPs, ips };
}
