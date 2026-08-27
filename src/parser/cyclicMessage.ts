import { bitValue, ByteCursor, ByteWriter, formatHexWord, formatReal } from './binary.ts'
import { stripLinkHeaders } from './frame.ts'
import { hexToBytes } from './hex.ts'
import { CYCLIC_MESSAGE_LAYOUT, cyclicMessageByteLength } from './layout.ts'
import type { ParseResult, ParsedRow } from './types.ts'

const MIN_BYTES = 20

export type CyclicFieldValues = {
  length?: number
  msgNumber?: number
  sequenceNumber?: number
  dStatMill?: number
  dStatMill2?: number
  coilNumber?: string
  reals?: Record<string, number>
}

export function parseHexDump(hexInput: string): ParseResult {
  const captured = hexToBytes(hexInput)
  const { payload: bytes, skipped } = stripLinkHeaders(captured)
  if (bytes.length < MIN_BYTES) {
    return {
      ok: false,
      error: `Hex dump too short. Expected at least ${MIN_BYTES} bytes. Got ${bytes.length} bytes.`,
    }
  }

  const cursor = new ByteCursor(bytes)
  const rows: ParsedRow[] = []
  let messageLength = 0
  let msgNumber = 0

  for (const field of CYCLIC_MESSAGE_LAYOUT) {
    if (field.kind === 'spacer') {
      rows.push({ type: 'empty' })
      continue
    }

    const offset = cursor.offset

    if (field.kind === 'word') {
      const value = cursor.readU16LE()
      if (field.name === 'Length') {
        messageLength = value
      }
      if (field.name === 'Msg Number') {
        msgNumber = value
      }
      rows.push({
        type: 'row',
        fieldName: field.name,
        description: field.description,
        dataType: 'Word',
        byteSize: '2',
        offset: String(offset),
        value: String(value),
      })
      continue
    }

    if (field.kind === 'long') {
      const value = cursor.readU32LE()
      rows.push({
        type: 'row',
        fieldName: field.name,
        description: field.description,
        dataType: 'Long',
        byteSize: '4',
        offset: String(offset),
        value: String(value),
      })
      continue
    }

    if (field.kind === 'bitfield') {
      const value = cursor.readU16LE()
      rows.push({
        type: 'bitfield',
        fieldName: field.name,
        description: field.description,
        dataType: 'Word(bit#)',
        byteSize: '2',
        offset: String(offset),
        value: formatHexWord(value),
      })
      field.bits.forEach((bit, bitIndex) => {
        const isTrue = bitValue(value, bitIndex)
        rows.push({
          type: 'bit',
          fieldName: bit.name,
          description: bit.description,
          dataType: String(bitIndex),
          byteSize: '',
          offset: '',
          value: isTrue ? 'TRUE' : 'FALSE',
          isTrue,
        })
      })
      continue
    }

    if (field.kind === 'real') {
      const value = cursor.readF32LE()
      rows.push({
        type: 'row',
        fieldName: field.name,
        description: field.description,
        dataType: 'REAL',
        byteSize: '4',
        offset: String(offset),
        value: formatReal(value),
      })
      continue
    }

    if (field.kind === 'char') {
      const value = cursor.readString(field.length)
      rows.push({
        type: 'coil',
        fieldName: field.name,
        description: field.description,
        dataType: 'char',
        byteSize: String(field.length),
        offset: String(offset),
        value,
      })
      continue
    }

    cursor.skip(field.length)
    rows.push({
      type: 'row',
      fieldName: field.name,
      description: field.description,
      dataType: 'REAL',
      byteSize: String(field.length),
      offset: String(offset),
      value: '(remaining bytes are padding)',
    })
  }

  return {
    ok: true,
    rows,
    byteCount: bytes.length,
    skippedBytes: skipped,
    messageLength,
    msgNumber,
  }
}

export function encodeCyclicMessage(values: CyclicFieldValues = {}): Uint8Array {
  const writer = new ByteWriter()
  const reals = values.reals ?? {}
  const expectedLength = cyclicMessageByteLength()

  for (const field of CYCLIC_MESSAGE_LAYOUT) {
    switch (field.kind) {
      case 'word':
        if (field.name === 'Length') {
          writer.writeU16LE(values.length ?? expectedLength)
        } else if (field.name === 'Msg Number') {
          writer.writeU16LE(values.msgNumber ?? 10)
        } else {
          writer.writeU16LE(0)
        }
        break
      case 'long':
        writer.writeU32LE(values.sequenceNumber ?? 0)
        break
      case 'bitfield':
        if (field.name === 'D_STAT_MILL') {
          writer.writeU16LE(values.dStatMill ?? 0)
        } else {
          writer.writeU16LE(values.dStatMill2 ?? 0)
        }
        break
      case 'real':
        writer.writeF32LE(reals[field.name] ?? 0)
        break
      case 'char':
        writer.writeString(values.coilNumber ?? '', field.length)
        break
      case 'padding':
        writer.writeZeros(field.length)
        break
      case 'spacer':
        break
    }
  }

  return writer.toUint8Array()
}
