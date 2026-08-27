import { useMemo, useState, type FormEvent } from 'react'
import { csvFilename, rowsToCsv } from '../parser/csv.ts'
import { parseHexDump } from '../parser/cyclicMessage.ts'
import { sampleHexDump } from '../parser/sample.ts'
import type { ParsedRow, ParseResult } from '../parser/types.ts'

function downloadCsv(rows: ParsedRow[]): void {
  const blob = new Blob([rowsToCsv(rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = csvFilename()
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function statusClass(isTrue: boolean): string {
  return isTrue ? 'text-green-700' : 'text-gray-500'
}

function ParsedTable({ rows }: { rows: ParsedRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 px-2 py-2">Field Name</th>
            <th className="border border-gray-400 px-2 py-2">Description</th>
            <th className="border border-gray-400 px-2 py-2">Data Type</th>
            <th className="border border-gray-400 px-2 py-2">Byte Size</th>
            <th className="border border-gray-400 px-2 py-2">Offset</th>
            <th className="border border-gray-400 px-2 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            if (row.type === 'empty') {
              return (
                <tr key={idx}>
                  <td className="border border-gray-400 px-2 py-1" colSpan={6}>
                    &nbsp;
                  </td>
                </tr>
              )
            }

            if (row.type === 'bitfield') {
              return (
                <tr key={idx}>
                  <td className="border border-gray-400 px-2 py-1 font-semibold">{row.fieldName}</td>
                  <td className="border border-gray-400 px-2 py-1">{row.description}</td>
                  <td className="border border-gray-400 px-2 py-1 text-center">{row.dataType}</td>
                  <td className="border border-gray-400 px-2 py-1 text-center">{row.byteSize}</td>
                  <td className="border border-gray-400 px-2 py-1 text-center bg-yellow-100">
                    {row.offset}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 bg-gray-200 font-mono text-blue-600">
                    {row.value}
                  </td>
                </tr>
              )
            }

            if (row.type === 'bit') {
              return (
                <tr key={idx}>
                  <td className="border border-gray-400 px-2 py-1 pl-6">{row.fieldName}</td>
                  <td className="border border-gray-400 px-2 py-1">{row.description}</td>
                  <td className="border border-gray-400 px-2 py-1 text-center">{row.dataType}</td>
                  <td className="border border-gray-400 px-2 py-1 text-center">{row.byteSize}</td>
                  <td className="border border-gray-400 px-2 py-1 text-center">{row.offset}</td>
                  <td
                    className={`border border-gray-400 px-2 py-1 bg-gray-200 font-semibold ${statusClass(row.isTrue)}`}
                  >
                    {row.value}
                  </td>
                </tr>
              )
            }

            if (row.type === 'coil') {
              return (
                <tr key={idx}>
                  <td className="border border-gray-400 px-2 py-1 bg-green-50 font-semibold">
                    {row.fieldName}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 bg-green-50">{row.description}</td>
                  <td className="border border-gray-400 px-2 py-1 bg-green-50 text-center">
                    {row.dataType}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 bg-green-50 text-center">
                    {row.byteSize}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 bg-green-50 text-center">
                    {row.offset}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 bg-green-200 font-mono font-bold text-green-900">
                    {row.value}
                  </td>
                </tr>
              )
            }

            return (
              <tr key={idx}>
                <td className="border border-gray-400 px-2 py-1">{row.fieldName}</td>
                <td className="border border-gray-400 px-2 py-1">{row.description}</td>
                <td className="border border-gray-400 px-2 py-1 text-center">{row.dataType}</td>
                <td className="border border-gray-400 px-2 py-1 text-center">{row.byteSize}</td>
                <td className="border border-gray-400 px-2 py-1 text-center">{row.offset}</td>
                <td className="border border-gray-400 px-2 py-1 bg-gray-200 font-mono">{row.value}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function WiresharkParser() {
  const [hexInput, setHexInput] = useState('')
  const [result, setResult] = useState<ParseResult | null>(null)

  const parsed = result?.ok ? result : null
  const error = result && !result.ok ? result.error : null

  const summary = useMemo(() => {
    if (!parsed) {
      return null
    }
    return `Parsed ${parsed.byteCount} bytes · Length=${parsed.messageLength} · Msg Number=${parsed.msgNumber}`
  }, [parsed])

  const handleParse = (event?: FormEvent) => {
    event?.preventDefault()
    setResult(parseHexDump(hexInput))
  }

  const handleSample = () => {
    const sample = sampleHexDump()
    setHexInput(sample)
    setResult(parseHexDump(sample))
  }

  const handleClear = () => {
    setHexInput('')
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-1 text-gray-800">Wireshark Message Parser</h1>
        <p className="text-sm text-gray-600 mb-4">
          Paste a TM Level 2 cyclic mill telegram copied from Wireshark. Little-endian words,
          longs, IEEE-754 REALs, and the D_STAT_MILL bitfields are decoded in place.
        </p>

        <form className="mb-6 space-y-3" onSubmit={handleParse}>
          <div>
            <label htmlFor="hex-dump" className="block text-sm font-semibold text-gray-700 mb-2">
              Paste Hex Dump:
            </label>
            <textarea
              id="hex-dump"
              className="w-full h-32 px-3 py-2 border-2 border-gray-300 rounded font-mono text-sm"
              placeholder="Example: 10 02 0A 00 C8 5C 00 00 0C 31 05 00..."
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
            >
              Parse Hex Dump
            </button>
            <button
              type="button"
              onClick={() => parsed && downloadCsv(parsed.rows)}
              disabled={!parsed}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Export to CSV
            </button>
            <button
              type="button"
              onClick={handleSample}
              className="px-6 py-2 bg-gray-800 text-white font-semibold rounded hover:bg-gray-900"
            >
              Load Sample
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-2 bg-white text-gray-700 font-semibold rounded border border-gray-300 hover:bg-gray-100"
            >
              Clear
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        {summary && <p className="mb-3 text-sm font-medium text-gray-700">{summary}</p>}

        {parsed && <ParsedTable rows={parsed.rows} />}

        {!parsed && !error && (
          <div className="text-center py-8 text-gray-500">
            Paste hex data above and click &quot;Parse Hex Dump&quot; to see the parsed message
            structure
          </div>
        )}
      </div>
    </div>
  )
}
