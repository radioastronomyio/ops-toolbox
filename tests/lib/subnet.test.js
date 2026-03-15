import { describe, it, expect } from 'vitest';
import {
  ipToUint32, uint32ToIp, getSubnetInfo, parseCIDR,
  splitSubnet, joinSubnet, flattenTree, createRootNode, expandCIDR,
} from '../../src/lib/subnet.js';

describe('ipToUint32', () => {
  it("'0.0.0.0' → 0", () => expect(ipToUint32('0.0.0.0')).toBe(0));
  it("'255.255.255.255' → 4294967295", () => expect(ipToUint32('255.255.255.255')).toBe(4294967295));
  it("'10.0.0.0' → 167772160", () => expect(ipToUint32('10.0.0.0')).toBe(167772160));
  it("'192.168.1.1' → 3232235777", () => expect(ipToUint32('192.168.1.1')).toBe(3232235777));
});

describe('uint32ToIp', () => {
  it('0 → 0.0.0.0', () => expect(uint32ToIp(0)).toBe('0.0.0.0'));
  it('4294967295 → 255.255.255.255', () => expect(uint32ToIp(4294967295)).toBe('255.255.255.255'));
  it('167772160 → 10.0.0.0', () => expect(uint32ToIp(167772160)).toBe('10.0.0.0'));
});

describe('getSubnetInfo', () => {
  it('(167772160, 24) → network 10.0.0.0, broadcast 10.0.0.255, hosts 254', () => {
    const info = getSubnetInfo(167772160, 24);
    expect(info.networkStr).toBe('10.0.0.0');
    expect(info.broadcastStr).toBe('10.0.0.255');
    expect(info.hosts).toBe(254);
  });

  it('(167772160, 16) → network 10.0.0.0, broadcast 10.0.255.255, hosts 65534', () => {
    const info = getSubnetInfo(167772160, 16);
    expect(info.networkStr).toBe('10.0.0.0');
    expect(info.broadcastStr).toBe('10.0.255.255');
    expect(info.hosts).toBe(65534);
  });

  it('(167772160, 32) → hosts 1, network = broadcast = first = last', () => {
    const info = getSubnetInfo(167772160, 32);
    expect(info.hosts).toBe(1);
    expect(info.networkStr).toBe(info.broadcastStr);
    expect(info.firstHostStr).toBe(info.lastHostStr);
  });

  it('(167772160, 31) → hosts 2', () => {
    const info = getSubnetInfo(167772160, 31);
    expect(info.hosts).toBe(2);
  });
});

describe('parseCIDR', () => {
  it("'10.0.0.0/16' → { network: 167772160, prefix: 16 }", () => {
    const r = parseCIDR('10.0.0.0/16');
    expect(r).toEqual({ network: 167772160, prefix: 16 });
  });

  it("'192.168.1.128/25' → correct values", () => {
    const r = parseCIDR('192.168.1.128/25');
    expect(r.network).toBe(ipToUint32('192.168.1.128'));
    expect(r.prefix).toBe(25);
  });

  it("'invalid' → null", () => expect(parseCIDR('invalid')).toBeNull());
  it("'' → null", () => expect(parseCIDR('')).toBeNull());
});

describe('splitSubnet', () => {
  it('splitting 10.0.0.0/16 → two children: 10.0.0.0/17 and 10.128.0.0/17', () => {
    const root = createRootNode('10.0.0.0/16');
    const split = splitSubnet(root);
    expect(split.children).toHaveLength(2);
    expect(uint32ToIp(split.children[0].network)).toBe('10.0.0.0');
    expect(split.children[0].prefix).toBe(17);
    expect(uint32ToIp(split.children[1].network)).toBe('10.0.128.0');
    expect(split.children[1].prefix).toBe(17);
  });

  it('splitting a /32 → returns null', () => {
    const node = createRootNode('10.0.0.1/32');
    expect(splitSubnet(node)).toBeNull();
  });
});

describe('joinSubnet', () => {
  it('joining two /17 siblings → parent /16 restored', () => {
    const root = createRootNode('10.0.0.0/16');
    const split = splitSubnet(root);
    const joined = joinSubnet(split);
    expect(joined.children).toBeNull();
    expect(joined.prefix).toBe(16);
  });

  it('joining node with no children → returns unchanged', () => {
    const node = createRootNode('10.0.0.0/16');
    expect(joinSubnet(node)).toBe(node);
  });
});

describe('flattenTree', () => {
  it('root with no children → [root]', () => {
    const root = createRootNode('10.0.0.0/16');
    expect(flattenTree(root)).toEqual([root]);
  });

  it('root split once → [child1, child2] in order', () => {
    const root = createRootNode('10.0.0.0/16');
    const split = splitSubnet(root);
    const leaves = flattenTree(split);
    expect(leaves).toHaveLength(2);
    expect(leaves[0].prefix).toBe(17);
    expect(uint32ToIp(leaves[0].network)).toBe('10.0.0.0');
    expect(uint32ToIp(leaves[1].network)).toBe('10.0.128.0');
  });

  it('root split, first child split again → [gc1, gc2, child2]', () => {
    const root = createRootNode('10.0.0.0/16');
    const split = splitSubnet(root);
    const firstChildSplit = splitSubnet(split.children[0]);
    const newRoot = { ...split, children: [firstChildSplit, split.children[1]] };
    const leaves = flattenTree(newRoot);
    expect(leaves).toHaveLength(3);
  });
});

describe('createRootNode', () => {
  it("'10.0.0.0/16' → node with correct network, prefix 16, no children", () => {
    const node = createRootNode('10.0.0.0/16');
    expect(node.network).toBe(167772160);
    expect(node.prefix).toBe(16);
    expect(node.children).toBeNull();
  });
});

describe('expandCIDR', () => {
  it("'192.168.1.0/30' → 4 IPs listed, first is 192.168.1.0, last is 192.168.1.3", () => {
    const result = expandCIDR('192.168.1.0/30');
    expect(result.ips).toHaveLength(4);
    expect(result.ips[0]).toBe('192.168.1.0');
    expect(result.ips[3]).toBe('192.168.1.3');
  });

  it("'10.0.0.0/24' → 256 IPs listed", () => {
    const result = expandCIDR('10.0.0.0/24');
    expect(result.ips).toHaveLength(256);
  });

  it("'10.0.0.0/16' → ips is null (too large), totalIPs is 65536", () => {
    const result = expandCIDR('10.0.0.0/16');
    expect(result.ips).toBeNull();
    expect(result.totalIPs).toBe(65536);
  });

  it('invalid input → returns null', () => {
    expect(expandCIDR('invalid')).toBeNull();
  });
});
