import { describe, expect, it } from 'vitest'
import { formatReal } from './binary.ts'
import { encodeCyclicMessage, parseHexDump } from './cyclicMessage.ts'
import { rowsToCsv } from './csv.ts'
import { bytesToHex } from './hex.ts'
import { cyclicMessageByteLength } from './layout.ts'
import { SAMPLE_VALUES } from './sample.ts'
import type { ParsedRow } from './types.ts'

function valueOf(rows: ParsedRow[], name: string): string {
  const row = rows.find((entry) => entry.type !== 'empty' && entry.fieldName === name)
  if (!row || row.type === 'empty') {
    throw new Error(`Missing row ${name}`)
  }
  return row.value
}

function bitOf(rows: ParsedRow[], name: string): string {
  const row = rows.find(
    (entry) => entry.type === 'bit' && (entry.fieldName === name || entry.description === name),
  )
  if (!row || row.type === 'empty') {
    throw new Error(`Missing bit ${name}`)
  }
  return row.value
}

describe('cyclic mill message parser', () => {
  it('reports an error when the dump is too short', () => {
    const result = parseHexDump('10 02 0A 00')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Got 4 bytes')
    }
  })

  it('round-trips the sample cyclic telegram', () => {
    const bytes = encodeCyclicMessage({
      ...SAMPLE_VALUES,
      reals: { ...SAMPLE_VALUES.reals },
    })
    expect(bytes).toHaveLength(cyclicMessageByteLength())
    expect(bytes).toHaveLength(228)

    const result = parseHexDump(bytesToHex(bytes))
    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.messageLength).toBe(228)
    expect(result.msgNumber).toBe(10)
    expect(valueOf(result.rows, 'Length')).toBe('228')
    expect(valueOf(result.rows, 'Msg Number')).toBe('10')
    expect(valueOf(result.rows, 'Sequence Number')).toBe(String(0x5cc8))
    expect(valueOf(result.rows, 'D_STAT_MILL')).toBe('0x310C')
    expect(valueOf(result.rows, 'D_STAT_MILL2')).toBe('0x0005')
    expect(valueOf(result.rows, 'EntryWidth')).toBe(formatReal(1250.5))
    expect(valueOf(result.rows, 'EntryCoilDiameter')).toBe(formatReal(1850.25))
    expect(valueOf(result.rows, 'MillSpeed')).toBe(formatReal(800))
    expect(valueOf(result.rows, 'EstimatedForwardSlip')).toBe(formatReal(1.02))
    expect(valueOf(result.rows, 'CoilNumber')).toBe('TM-COIL-001')
    expect(valueOf(result.rows, 'Torque')).toBe(formatReal(185.5))
    expect(valueOf(result.rows, 'length')).toBe(formatReal(1250.75))
    expect(valueOf(result.rows, 'Actual Exit Gauge')).toBe(formatReal(0.032))
    expect(valueOf(result.rows, 'Spare1')).toBe(formatReal(0))

    expect(bitOf(result.rows, 'PassInProgress')).toBe('TRUE')
    expect(bitOf(result.rows, 'MillRolling')).toBe('TRUE')
    expect(bitOf(result.rows, 'Coil on Pay Off Reel')).toBe('TRUE')
    expect(bitOf(result.rows, 'EntryTensionEstablished')).toBe('TRUE')
    expect(bitOf(result.rows, 'MillStopped')).toBe('FALSE')
    expect(bitOf(result.rows, 'DrivesInEStop')).toBe('TRUE')
    expect(bitOf(result.rows, 'DrivesInRun')).toBe('FALSE')
  })

  it('keeps Length at offset 0 and Msg Number at offset 2', () => {
    const bytes = encodeCyclicMessage({
      length: 528,
      msgNumber: 10,
      sequenceNumber: 1,
    })
    const result = parseHexDump(Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(''))
    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }
    const lengthRow = result.rows.find((row) => row.type !== 'empty' && row.fieldName === 'Length')
    const msgRow = result.rows.find((row) => row.type !== 'empty' && row.fieldName === 'Msg Number')
    expect(lengthRow && lengthRow.type !== 'empty' ? lengthRow.offset : undefined).toBe('0')
    expect(lengthRow && lengthRow.type !== 'empty' ? lengthRow.value : undefined).toBe('528')
    expect(msgRow && msgRow.type !== 'empty' ? msgRow.offset : undefined).toBe('2')
    expect(msgRow && msgRow.type !== 'empty' ? msgRow.value : undefined).toBe('10')
  })

  it('exports CSV with a header and without spacer rows', () => {
    const bytes = encodeCyclicMessage({
      ...SAMPLE_VALUES,
      reals: { ...SAMPLE_VALUES.reals },
    })
    const result = parseHexDump(bytesToHex(bytes))
    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }
    const csv = rowsToCsv(result.rows)
    const lines = csv.trim().split('\n')
    expect(lines[0]).toBe('Field Name,Description,Data Type,Byte Size,Offset,Value')
    expect(csv).toContain('"CoilNumber","echo back","char","20"')
    expect(csv).toContain('"TM-COIL-001"')
    expect(csv).not.toContain(',,,,,')
  })
})
