export type BitSpec = {
  name: string
  description: string
}

export type FieldSpec =
  | { kind: 'word'; name: string; description: string }
  | { kind: 'long'; name: string; description: string }
  | { kind: 'real'; name: string; description: string }
  | { kind: 'char'; name: string; description: string; length: number }
  | { kind: 'bitfield'; name: string; description: string; bits: BitSpec[] }
  | { kind: 'padding'; name: string; description: string; length: number }
  | { kind: 'spacer' }

type ValueRow = {
  fieldName: string
  description: string
  dataType: string
  byteSize: string
  offset: string
  value: string
}

export type ParsedRow =
  | { type: 'empty' }
  | ({ type: 'row' } & ValueRow)
  | ({ type: 'bitfield' } & ValueRow)
  | ({ type: 'bit' } & ValueRow & { isTrue: boolean })
  | ({ type: 'coil' } & ValueRow)

export type ParseSuccess = {
  ok: true
  rows: ParsedRow[]
  byteCount: number
  messageLength: number
  msgNumber: number
}

export type ParseFailure = {
  ok: false
  error: string
}

export type ParseResult = ParseSuccess | ParseFailure
