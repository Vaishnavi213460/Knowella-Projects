import { useState } from 'react'
import Papa from 'papaparse'
import { Upload, Download, Play, Trash2, Plus } from 'lucide-react'

export default function CSVProcessor() {
  const [headers, setHeaders] = useState([])
  const [data, setData] = useState([])
  const [preview, setPreview] = useState([])
  const [fileName, setFileName] = useState('')
  const [rules, setRules] = useState([])
  const [applied, setApplied] = useState(false)

  // ── File upload ──────────────────────────────────────────
  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    setApplied(false)
    setRules([])

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setHeaders(result.meta.fields)
        setData(result.data)
        setPreview(result.data.slice(0, 5))
      },
    })
  }

  // ── Rules ────────────────────────────────────────────────
  function addRule(type) {
    const base = { id: Date.now(), type }
    if (type === 'filter')  setRules([...rules, { ...base, column: headers[0], condition: '>', value: '' }])
    if (type === 'rename')  setRules([...rules, { ...base, from: headers[0], to: '' }])
    if (type === 'sort')    setRules([...rules, { ...base, column: headers[0], order: 'asc' }])
    if (type === 'remove')  setRules([...rules, { ...base, column: headers[0] }])
  }

  function updateRule(id, key, val) {
    setRules(rules.map(r => r.id === id ? { ...r, [key]: val } : r))
  }

  function deleteRule(id) {
    setRules(rules.filter(r => r.id !== id))
  }

  // ── Apply transforms ─────────────────────────────────────
  function applyRules() {
    let result = [...data]
    let currentHeaders = [...headers]

    rules.forEach(rule => {
      if (rule.type === 'filter') {
        result = result.filter(row => {
          const val = parseFloat(row[rule.column])
          const ref = parseFloat(rule.value)
          if (isNaN(val) || isNaN(ref)) return true
          if (rule.condition === '>')  return val > ref
          if (rule.condition === '<')  return val < ref
          if (rule.condition === '==') return val === ref
          return true
        })
      }

      if (rule.type === 'rename') {
        result = result.map(row => {
          const updated = { ...row, [rule.to]: row[rule.from] }
          delete updated[rule.from]
          return updated
        })
        currentHeaders = currentHeaders.map(h => h === rule.from ? rule.to : h)
      }

      if (rule.type === 'sort') {
        result = [...result].sort((a, b) => {
          const av = a[rule.column], bv = b[rule.column]
          const an = parseFloat(av), bn = parseFloat(bv)
          if (!isNaN(an) && !isNaN(bn)) return rule.order === 'asc' ? an - bn : bn - an
          return rule.order === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
        })
      }

      if (rule.type === 'remove') {
        result = result.map(row => {
          const r = { ...row }
          delete r[rule.column]
          return r
        })
        currentHeaders = currentHeaders.filter(h => h !== rule.column)
      }
    })

    setHeaders(currentHeaders)
    setData(result)
    setPreview(result.slice(0, 5))
    setApplied(true)
  }

  // ── Export ───────────────────────────────────────────────
  function downloadCSV() {
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `processed_${fileName}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── UI ───────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">CSV Processor</h2>
        <p className="text-sm text-gray-500 mt-1">Upload a CSV, apply transform rules, and export the result</p>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-10 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="text-gray-400 mb-2" size={32} />
          <span className="text-sm text-gray-500">
            {fileName ? fileName : 'Click to upload a CSV file'}
          </span>
          <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </label>
      </div>

      {/* Preview table */}
      {preview.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">
            Preview (first 5 rows) — {data.length} total rows
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  {headers.map(h => (
                    <th key={h} className="px-3 py-2 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    {headers.map(h => (
                      <td key={h} className="px-3 py-2 text-gray-700">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rules builder */}
      {headers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-600">Transform Rules</h3>

          {/* Add rule buttons */}
          <div className="flex flex-wrap gap-2">
            {['filter', 'rename', 'sort', 'remove'].map(type => (
              <button
                key={type}
                onClick={() => addRule(type)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-lg text-xs font-medium transition-colors"
              >
                <Plus size={12} /> {type}
              </button>
            ))}
          </div>

          {/* Rule list */}
          {rules.length === 0 && (
            <p className="text-xs text-gray-400">No rules added yet. Click a button above to add a transform.</p>
          )}

          {rules.map(rule => (
            <div key={rule.id} className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs font-bold text-blue-600 uppercase w-14">{rule.type}</span>

              {rule.type === 'filter' && <>
                <select className="input-sm" value={rule.column} onChange={e => updateRule(rule.id, 'column', e.target.value)}>
                  {headers.map(h => <option key={h}>{h}</option>)}
                </select>
                <select className="input-sm" value={rule.condition} onChange={e => updateRule(rule.id, 'condition', e.target.value)}>
                  {['>', '<', '=='].map(op => <option key={op}>{op}</option>)}
                </select>
                <input className="input-sm w-24" placeholder="value" value={rule.value} onChange={e => updateRule(rule.id, 'value', e.target.value)} />
              </>}

              {rule.type === 'rename' && <>
                <select className="input-sm" value={rule.from} onChange={e => updateRule(rule.id, 'from', e.target.value)}>
                  {headers.map(h => <option key={h}>{h}</option>)}
                </select>
                <span className="text-xs text-gray-400">to</span>
                <input className="input-sm w-32" placeholder="new name" value={rule.to} onChange={e => updateRule(rule.id, 'to', e.target.value)} />
              </>}

              {rule.type === 'sort' && <>
                <select className="input-sm" value={rule.column} onChange={e => updateRule(rule.id, 'column', e.target.value)}>
                  {headers.map(h => <option key={h}>{h}</option>)}
                </select>
                <select className="input-sm" value={rule.order} onChange={e => updateRule(rule.id, 'order', e.target.value)}>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </>}

              {rule.type === 'remove' && <>
                <select className="input-sm" value={rule.column} onChange={e => updateRule(rule.id, 'column', e.target.value)}>
                  {headers.map(h => <option key={h}>{h}</option>)}
                </select>
              </>}

              <button onClick={() => deleteRule(rule.id)} className="ml-auto text-red-400 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Apply button */}
          <button
            onClick={applyRules}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Play size={14} /> Apply Rules
          </button>
        </div>
      )}

      {/* Download */}
      {applied && data.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-green-700">Transform complete</p>
            <p className="text-xs text-green-600">{data.length} rows · {headers.length} columns</p>
          </div>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={14} /> Download CSV
          </button>
        </div>
      )}
    </div>
  )
}