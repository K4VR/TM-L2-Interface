export class ByteCursor {
  offset = 0
  readonly bytes: Uint8Array

  constructor(bytes: Uint8Array) {
    this.bytes = bytes
  }

  get length(): number {
    return this.bytes.length
  }

  has(count: number): boolean {
    return this.offset + count <= this.bytes.length
  }

  readU16LE(): number {
    const start = this.offset
    this.offset += 2
    if (start + 2 > this.bytes.length) {
      return 0
    }
    return (this.bytes[start] ?? 0) | ((this.bytes[start + 1] ?? 0) << 8)
  }

  readU32LE(): number {
    const start = this.offset
    this.offset += 4
    if (start + 4 > this.bytes.length) {
      return 0
    }
    return (
      ((this.bytes[start] ?? 0) |
        ((this.bytes[start + 1] ?? 0) << 8) |
        ((this.bytes[start + 2] ?? 0) << 16) |
        ((this.bytes[start + 3] ?? 0) << 24)) >>>
      0
    )
  }

  readF32LE(): number {
    const start = this.offset
    this.offset += 4
    if (start + 4 > this.bytes.length) {
      return 0
    }
    const buffer = new ArrayBuffer(4)
    const view = new DataView(buffer)
    for (let i = 0; i < 4; i += 1) {
      view.setUint8(i, this.bytes[start + i] ?? 0)
    }
    return view.getFloat32(0, true)
  }

  readString(length: number): string {
    const start = this.offset
    this.offset += length
    let text = ''
    const end = Math.min(start + length, this.bytes.length)
    for (let i = start; i < end; i += 1) {
      const byte = this.bytes[i] ?? 0
      if (byte === 0) {
        break
      }
      text += String.fromCharCode(byte)
    }
    return text
  }

  skip(count: number): void {
    this.offset += count
  }
}

export class ByteWriter {
  private readonly bytes: number[] = []

  writeU16LE(value: number): void {
    const v = value >>> 0
    this.bytes.push(v & 0xff, (v >>> 8) & 0xff)
  }

  writeU32LE(value: number): void {
    const v = value >>> 0
    this.bytes.push(
      v & 0xff,
      (v >>> 8) & 0xff,
      (v >>> 16) & 0xff,
      (v >>> 24) & 0xff,
    )
  }

  writeF32LE(value: number): void {
    const buffer = new ArrayBuffer(4)
    const view = new DataView(buffer)
    view.setFloat32(0, value, true)
    for (let i = 0; i < 4; i += 1) {
      this.bytes.push(view.getUint8(i))
    }
  }

  writeString(value: string, length: number): void {
    for (let i = 0; i < length; i += 1) {
      this.bytes.push(i < value.length ? value.charCodeAt(i) & 0xff : 0)
    }
  }

  writeZeros(length: number): void {
    for (let i = 0; i < length; i += 1) {
      this.bytes.push(0)
    }
  }

  toUint8Array(): Uint8Array {
    return Uint8Array.from(this.bytes)
  }
}

export function formatHexWord(value: number): string {
  return `0x${value.toString(16).toUpperCase().padStart(4, '0')}`
}

export function formatReal(value: number): string {
  if (!Number.isFinite(value)) {
    return String(value)
  }
  return value.toFixed(6)
}

export function bitValue(word: number, bit: number): boolean {
  return (word & (1 << bit)) !== 0
}
