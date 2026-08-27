import { describe, expect, it } from 'vitest'
import {
  buildEthernetIpv4TcpHeader,
  framePayloadOffset,
  skippedHeaderLabel,
  stripLinkHeaders,
} from './frame.ts'

describe('frame header stripping', () => {
  it('leaves a cyclic payload unchanged', () => {
    const payload = Uint8Array.from([0xe4, 0x00, 0x0a, 0x00, ...Array(24).fill(0)])
    expect(framePayloadOffset(payload)).toBe(0)
    expect(stripLinkHeaders(payload).skipped).toBe(0)
  })

  it('skips a 54-byte Ethernet/IP/TCP header', () => {
    const payload = Uint8Array.from({ length: 40 }, (_, i) => i + 1)
    const frame = new Uint8Array(54 + payload.length)
    frame.set(buildEthernetIpv4TcpHeader(payload.length), 0)
    frame.set(payload, 54)
    expect(framePayloadOffset(frame)).toBe(54)
    const stripped = stripLinkHeaders(frame)
    expect(stripped.skipped).toBe(54)
    expect(Array.from(stripped.payload)).toEqual(Array.from(payload))
    expect(skippedHeaderLabel(54)).toContain('54-byte Ethernet/IP/TCP')
  })
})
