#!/usr/bin/env node
/**
 * count-frames.mjs
 *
 * Given a 60fps screen recording of a copilot answering the benchmark
 * question, prompt for two frame indices and compute the perceived latency
 * delta. Deliberately low-tech — every measurement is auditable by hand.
 *
 * Usage:
 *   node harness/count-frames.mjs recordings/mirly-run-3.mov
 *
 * Workflow:
 *   1. Open the recording in QuickTime / IINA / mpv
 *   2. Step frame-by-frame to the exact frame where you SEE the last
 *      syllable of the question (lip-stops moving / waveform falls quiet).
 *      Note the timestamp; multiply by FPS for the frame index.
 *   3. Step to the frame where the FIRST character of the copilot's answer
 *      becomes visible on screen. Note that frame index.
 *   4. Paste both numbers when prompted. Delta is printed in ms.
 *
 * For full automation we could ffprobe the recording for OCR-detectable
 * text on each frame, but practical experience: human frame-stepping at 60
 * fps is faster + more accurate per recording (~30s/run) and removes any
 * "did the model interpret a wrong glyph?" failure mode from the dataset.
 */

import readline from 'node:readline'
import { existsSync } from 'node:fs'

const FPS = 60

const [, , file] = process.argv
if (!file) {
  console.error('usage: node count-frames.mjs <path-to-recording>')
  process.exit(1)
}
if (!existsSync(file)) {
  console.error(`file not found: ${file}`)
  process.exit(1)
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise((res) => rl.question(q, res))

console.log(`\n┌─ latency-benchmark-2026 ──────────────────────────────────────┐`)
console.log(`│  Recording: ${file}`)
console.log(`│  FPS:       ${FPS}`)
console.log(`└───────────────────────────────────────────────────────────────┘\n`)

const lastSyllableFrame = parseInt(
  await ask('Frame index of last syllable of question:   '),
  10
)
const firstTokenFrame = parseInt(
  await ask('Frame index of first visible answer token:  '),
  10
)
rl.close()

if (!Number.isFinite(lastSyllableFrame) || !Number.isFinite(firstTokenFrame)) {
  console.error('\nBoth values must be integers. Aborting.')
  process.exit(1)
}
if (firstTokenFrame < lastSyllableFrame) {
  console.error('\nfirst-token frame is before last-syllable frame; check the recording.')
  process.exit(1)
}

const deltaFrames = firstTokenFrame - lastSyllableFrame
const deltaMs = Math.round((deltaFrames / FPS) * 1000)

console.log(`\n  ${deltaFrames} frames at ${FPS} fps = ${deltaMs} ms`)
console.log(`  Append this row to data/runs-<date>.csv:\n`)
console.log(`  ,<vendor>,<run-id>,<warm|cold>,${deltaMs}`)
console.log()
