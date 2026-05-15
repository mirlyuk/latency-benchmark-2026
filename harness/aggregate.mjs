#!/usr/bin/env node
/**
 * aggregate.mjs
 *
 * Read a per-run CSV (one row = one run of one vendor) and emit the
 * vendor-level summary that the README + mirly.co.uk/latency table use.
 *
 * Input row schema:
 *   date,vendor,run_id,kind,ms
 *   2026-05-15,Mirly,1,cold,412
 *   2026-05-15,Mirly,2,warm,131
 *   ...
 *
 * Output: pretty table to stdout + an aggregated CSV to
 * data/summary-<date>.csv.
 *
 * No deps — node 18+ only.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const [, , inputPath] = process.argv
if (!inputPath) {
  console.error('usage: node aggregate.mjs data/runs-2026-05-15.csv')
  process.exit(1)
}

const raw = readFileSync(inputPath, 'utf-8').trim().split(/\r?\n/)
const header = raw.shift()
if (header !== 'date,vendor,run_id,kind,ms') {
  console.error(`unexpected header: ${header}`)
  process.exit(1)
}

const rows = raw.map((line) => {
  const [date, vendor, run_id, kind, ms] = line.split(',')
  return { date, vendor, run_id, kind, ms: Number(ms) }
})

const byVendor = new Map()
for (const r of rows) {
  if (!byVendor.has(r.vendor)) byVendor.set(r.vendor, [])
  byVendor.get(r.vendor).push(r)
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))]
}

const summary = []
for (const [vendor, runs] of byVendor) {
  const warm = runs.filter((r) => r.kind === 'warm').map((r) => r.ms).sort((a, b) => a - b)
  const cold = runs.filter((r) => r.kind === 'cold').map((r) => r.ms).sort((a, b) => a - b)
  summary.push({
    vendor,
    p50: percentile(warm, 50),
    p95: percentile(warm, 95),
    cold: cold[0] ?? null,
    n: warm.length,
  })
}

summary.sort((a, b) => (a.p50 ?? Infinity) - (b.p50 ?? Infinity))

// Pretty print
console.log('\nVendor             p50    p95   cold    n (warm)')
console.log('────────────────  ─────  ─────  ─────  ───────')
for (const s of summary) {
  console.log(
    `${s.vendor.padEnd(18)} ${String(s.p50 ?? '-').padStart(5)}  ${String(s.p95 ?? '-').padStart(5)}  ${String(s.cold ?? '-').padStart(5)}  ${String(s.n).padStart(7)}`
  )
}

// Write summary CSV
const date = rows[0]?.date ?? new Date().toISOString().slice(0, 10)
const outPath = path.join(path.dirname(inputPath), `summary-${date}.csv`)
const out = ['vendor,p50_ms,p95_ms,cold_ms,n_warm']
for (const s of summary) {
  out.push(`${s.vendor},${s.p50 ?? ''},${s.p95 ?? ''},${s.cold ?? ''},${s.n}`)
}
writeFileSync(outPath, out.join('\n') + '\n')
console.log(`\nSummary written to ${outPath}`)
