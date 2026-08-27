import type { ParsedRow } from './types.ts'

const CSV_HEADER = 'Field Name,Description,Data Type,Byte Size,Offset,Value'

function csvCell(value: string): string {
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

export function rowsToCsv(rows: ParsedRow[]): string {
  const lines = [CSV_HEADER]
  for (const row of rows) {
    if (row.type === 'empty') {
      continue
    }
    lines.push(
      [
        row.fieldName,
        row.description,
        row.dataType,
        row.byteSize,
        row.offset,
        row.value,
      ]
        .map(csvCell)
        .join(','),
    )
  }
  return `${lines.join('\n')}\n`
}

export function csvFilename(date = new Date()): string {
  const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `wireshark_parsed_${timestamp}.csv`
}
