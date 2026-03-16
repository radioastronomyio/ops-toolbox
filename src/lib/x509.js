import * as pkijs from 'pkijs';
import * as asn1js from 'asn1js';

export function pemToArrayBuffer(pem) {
  if (!pem || typeof pem !== 'string') throw new Error('Invalid PEM');
  const b64 = pem.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\s/g, '');
  if (!b64) throw new Error('Empty PEM body');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function formatDN(rdns) {
  if (!rdns || !rdns.typesAndValues) return '';
  const parts = rdns.typesAndValues.map(tv => {
    const type = tv.type;
    const value = tv.value?.valueBlock?.value || '';
    const names = { '2.5.4.3': 'CN', '2.5.4.6': 'C', '2.5.4.7': 'L', '2.5.4.8': 'ST', '2.5.4.10': 'O', '2.5.4.11': 'OU' };
    const name = names[type] || type;
    return `${name}=${value}`;
  });
  return parts.join(', ');
}

export function parseCertificate(pemString) {
  try {
    const buf = pemToArrayBuffer(pemString);
    const asn1 = asn1js.fromBER(buf);
    if (asn1.offset === -1) throw new Error('ASN.1 parse failed');
    const cert = new pkijs.Certificate({ schema: asn1.result });
    const subject = formatDN(cert.subject);
    const issuer = formatDN(cert.issuer);
    const serialNumber = cert.serialNumber?.valueBlock?.valueHexView
      ? Array.from(cert.serialNumber.valueBlock.valueHexView).map(b => b.toString(16).padStart(2, '0')).join(':')
      : '';
    const validFrom = cert.notBefore?.value;
    const validTo = cert.notAfter?.value;
    const sigAlg = cert.signatureAlgorithm?.algorithmId || '';
    let publicKeyAlgorithm = '';
    let publicKeySize = '';
    try {
      const spki = cert.subjectPublicKeyInfo;
      publicKeyAlgorithm = spki?.algorithm?.algorithmId || '';
      const modHex = spki?.parsedKey?.modulus?.valueBlock?.valueHex;
      if (modHex) {
        const bytes = new Uint8Array(modHex);
        // DER encodes a leading 0x00 when high bit is set; strip it for bit length
        const leadingZero = bytes.length > 0 && bytes[0] === 0 ? 1 : 0;
        publicKeySize = String((bytes.length - leadingZero) * 8);
      }
    } catch {}
    return { subject, issuer, serialNumber, validFrom, validTo, signatureAlgorithm: sigAlg, publicKeyAlgorithm, publicKeySize };
  } catch (e) {
    return null;
  }
}
