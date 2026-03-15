/**
 * Converts a dotted quad IP string to a 32-bit integer.
 * @param {string} ipStr - IP address in dotted quad format (e.g., "192.168.1.0")
 * @returns {number} 32-bit integer representation of the IP address
 * @throws {Error} If the IP string is invalid
 */
export function stringToIP(ipStr) {
  const parts = ipStr.split('.');
  if (parts.length !== 4) {
    throw new Error('Invalid IP address: must have 4 octets');
  }

  let ip = 0;
  for (let i = 0; i < 4; i++) {
    const octet = parseInt(parts[i], 10);
    if (isNaN(octet) || octet < 0 || octet > 255) {
      throw new Error('Invalid IP address: octets must be 0-255');
    }
    ip = (ip << 8) | octet;
  }

  return ip >>> 0; // Force unsigned 32-bit
}

/**
 * Converts a 32-bit integer to a dotted quad IP string.
 * @param {number} ipInt - 32-bit integer representation of the IP address
 * @returns {string} IP address in dotted quad format
 */
export function ipToString(ipInt) {
  return [
    (ipInt >>> 24) & 0xFF,
    (ipInt >>> 16) & 0xFF,
    (ipInt >>> 8) & 0xFF,
    ipInt & 0xFF
  ].join('.');
}

/**
 * Parses a CIDR notation string into its IP and prefix components.
 * @param {string} cidrString - CIDR notation (e.g., "192.168.1.0/24")
 * @returns {{ip: number, prefix: number}} Object containing IP as integer and prefix length
 * @throws {Error} If the CIDR string is invalid
 */
export function parseCIDR(cidrString) {
  const parts = cidrString.split('/');
  if (parts.length !== 2) {
    throw new Error('Invalid CIDR notation: must contain exactly one "/"');
  }

  const ip = stringToIP(parts[0]);
  const prefix = parseInt(parts[1], 10);

  if (isNaN(prefix) || prefix < 0 || prefix > 32) {
    throw new Error('Invalid CIDR notation: prefix must be 0-32');
  }

  return { ip, prefix };
}

/**
 * Calculates subnet information from an IP address and prefix length.
 * @param {number} ip - 32-bit integer representation of the IP address
 * @param {number} prefix - Prefix length (0-32)
 * @returns {{networkAddress: string, broadcastAddress: string, subnetMask: string, firstHost: string, lastHost: string, totalHosts: number, prefixLength: number}}
 */
export function calculateSubnet(ip, prefix) {
  // Calculate subnet mask and network address
  let mask, networkAddress, broadcastAddress;

  if (prefix === 0) {
    // Special case for /0: entire IPv4 space
    mask = 0;
    networkAddress = 0;
    broadcastAddress = 0xFFFFFFFF >>> 0;
  } else {
    // Normal calculation
    mask = (~0 << (32 - prefix)) >>> 0;
    networkAddress = (ip & mask) >>> 0;
    const wildcardMask = (~mask) >>> 0;
    broadcastAddress = (networkAddress | wildcardMask) >>> 0;
  }

  // Calculate first and last usable hosts
  let firstHost, lastHost, totalHosts;

  if (prefix === 32) {
    // Single host, no usable hosts
    firstHost = networkAddress;
    lastHost = networkAddress;
    totalHosts = 0;
  } else if (prefix === 31) {
    // Point-to-point link, no usable hosts per traditional subnetting
    firstHost = networkAddress;
    lastHost = broadcastAddress;
    totalHosts = 0;
  } else {
    // Normal subnet
    firstHost = (networkAddress + 1) >>> 0;
    lastHost = (broadcastAddress - 1) >>> 0;
    totalHosts = broadcastAddress - networkAddress - 1;
  }

  return {
    networkAddress: ipToString(networkAddress),
    broadcastAddress: ipToString(broadcastAddress),
    subnetMask: ipToString(mask),
    firstHost: ipToString(firstHost),
    lastHost: ipToString(lastHost),
    totalHosts,
    prefixLength: prefix
  };
}
