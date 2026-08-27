const HEX_PAIR = /[0-9A-Fa-f]{2}/g
const DUMP_LINE =
  /^\s*([0-9A-Fa-f]{3,8})\s{1,3}((?:[0-9A-Fa-f]{2}[\s-]*)+)(?:\s{2,}.*)?$/

function bytesFromHexPairs(hex: string): number[] {
  const pairs = hex.match(HEX_PAIR) ?? []
  return pairs.map((pair) => Number.parseInt(pair, 16))
}

/**
 * Parse Wireshark-style hex dumps (offset + bytes + optional ASCII) as well as
 * raw hex streams, space/colon separated bytes, and 0x-prefixed values.
 */
export function hexToBytes(hex: string): Uint8Array {
  const dumpBytes = bytesFromWiresharkDump(hex)
  if (dumpBytes) {
    return dumpBytes
  }

  const cleaned = hex.replace(/0x/gi, '').replace(/[^0-9A-Fa-f]/g, '')
  return Uint8Array.from(bytesFromHexPairs(cleaned))
}

function bytesFromWiresharkDump(hex: string): Uint8Array | null {
  const lines = hex.split(/\r?\n/)
  const bytes: number[] = []
  let matchedLines = 0
  let nonEmptyLines = 0

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      continue
    }
    nonEmptyLines += 1
    const match = trimmed.match(DUMP_LINE)
    if (!match) {
      continue
    }
    matchedLines += 1
    bytes.push(...bytesFromHexPairs(match[2] ?? ''))
  }

  if (matchedLines === 0 || matchedLines < nonEmptyLines / 2) {
    return null
  }

  return Uint8Array.from(bytes)
}

export function bytesToHex(bytes: Uint8Array, group = 16): string {
  const parts: string[] = []
  for (let i = 0; i < bytes.length; i += 1) {
    parts.push((bytes[i] ?? 0).toString(16).toUpperCase().padStart(2, '0'))
  }
  if (group <= 0) {
    return parts.join(' ')
  }
  const lines: string[] = []
  for (let i = 0; i < parts.length; i += group) {
    const offset = i.toString(16).toUpperCase().padStart(4, '0')
    lines.push(`${offset}  ${parts.slice(i, i + group).join(' ')}`)
  }
  return lines.join('\n')
}
