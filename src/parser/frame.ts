const ETHERTYPE_IPV4 = 0x0800
const ETHERTYPE_VLAN = 0x8100
const IPPROTO_TCP = 6
const IPPROTO_UDP = 17
const MIN_PAYLOAD = 20

function readU16BE(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0)
}

/**
 * Return the byte offset of the TCP/UDP payload in an Ethernet IPv4 frame.
 * Standard Ethernet (14) + IPv4 (20) + TCP (20) is 54 bytes, which is the
 * prefix pasted from a full Wireshark packet copy. Returns 0 when the dump
 * is already just the cyclic telegram.
 */
export function framePayloadOffset(bytes: Uint8Array): number {
  if (bytes.length < 54) {
    return 0
  }

  let ethernetHeader = 14
  let etherType = readU16BE(bytes, 12)
  if (etherType === ETHERTYPE_VLAN) {
    if (bytes.length < 58) {
      return 0
    }
    ethernetHeader = 18
    etherType = readU16BE(bytes, 16)
  }
  if (etherType !== ETHERTYPE_IPV4) {
    return 0
  }

  const ipStart = ethernetHeader
  const versionIhl = bytes[ipStart] ?? 0
  if (versionIhl >> 4 !== 4) {
    return 0
  }
  const ihl = (versionIhl & 0x0f) * 4
  if (ihl < 20 || bytes.length < ipStart + ihl + 8) {
    return 0
  }

  const protocol = bytes[ipStart + 9] ?? 0
  if (protocol === IPPROTO_TCP) {
    const tcpStart = ipStart + ihl
    if (bytes.length < tcpStart + 20) {
      return 0
    }
    const tcpLen = (((bytes[tcpStart + 12] ?? 0) >> 4) & 0x0f) * 4
    if (tcpLen < 20) {
      return 0
    }
    const payload = tcpStart + tcpLen
    if (bytes.length < payload + MIN_PAYLOAD) {
      return 0
    }
    return payload
  }

  if (protocol === IPPROTO_UDP) {
    const payload = ipStart + ihl + 8
    if (bytes.length < payload + MIN_PAYLOAD) {
      return 0
    }
    return payload
  }

  return 0
}

export function stripLinkHeaders(bytes: Uint8Array): {
  payload: Uint8Array
  skipped: number
} {
  const skipped = framePayloadOffset(bytes)
  if (skipped <= 0) {
    return { payload: bytes, skipped: 0 }
  }
  return { payload: bytes.subarray(skipped), skipped }
}

export function skippedHeaderLabel(skipped: number): string {
  if (skipped <= 0) {
    return ''
  }
  if (skipped === 54) {
    return `skipped ${skipped}-byte Ethernet/IP/TCP header`
  }
  return `skipped ${skipped}-byte frame header`
}

/** Standard 54-byte Ethernet + IPv4 + TCP header with no options. */
export function buildEthernetIpv4TcpHeader(payloadLength: number): Uint8Array {
  const ipTotal = 20 + 20 + payloadLength
  const header = new Uint8Array(54)
  header.set([0xff, 0xff, 0xff, 0xff, 0xff, 0xff], 0)
  header.set([0x00, 0x11, 0x22, 0x33, 0x44, 0x55], 6)
  header[12] = 0x08
  header[13] = 0x00
  header[14] = 0x45
  header[15] = 0x00
  header[16] = (ipTotal >> 8) & 0xff
  header[17] = ipTotal & 0xff
  header[22] = 64
  header[23] = 6
  header[26] = 10
  header[29] = 1
  header[30] = 10
  header[33] = 2
  header[34] = 0xc3
  header[35] = 0x50
  header[36] = 0x1f
  header[37] = 0x40
  header[46] = 0x50
  header[47] = 0x18
  return header
}
