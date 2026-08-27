import { describe, expect, it } from 'vitest'
import { hexToBytes } from './hex.ts'

describe('hexToBytes', () => {
  it('parses space-separated hex', () => {
    expect(Array.from(hexToBytes('10 02 0A 00'))).toEqual([0x10, 0x02, 0x0a, 0x00])
  })

  it('parses a continuous hex stream and ignores 0x prefixes', () => {
    expect(Array.from(hexToBytes('0x10020A00'))).toEqual([0x10, 0x02, 0x0a, 0x00])
  })

  it('parses colon-separated bytes', () => {
    expect(Array.from(hexToBytes('10:02:0a:00'))).toEqual([0x10, 0x02, 0x0a, 0x00])
  })

  it('ignores Wireshark dump offsets and ASCII columns', () => {
    const dump = [
      '0000  10 02 0a 00 c8 5c 00 00 0c 31 05 00 00 00 80 44   .....\\...1.....D',
      '0010  00 00 00 00 54 4d 2d 43 4f 49 4c 2d 30 30 31 00   ....TM-COIL-001.',
    ].join('\n')

    const bytes = hexToBytes(dump)
    expect(Array.from(bytes.slice(0, 8))).toEqual([
      0x10, 0x02, 0x0a, 0x00, 0xc8, 0x5c, 0x00, 0x00,
    ])
    expect(bytes).toHaveLength(32)
    expect(Array.from(bytes.slice(20, 31))).toEqual(
      Array.from(new TextEncoder().encode('TM-COIL-001')),
    )
  })
})
