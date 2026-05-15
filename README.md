# latency-benchmark-2026

**Reproducible end-to-end first-token latency benchmark across the six leading AI interview copilots.**

This repository contains the raw audio, screen recordings, frame-count spreadsheet, and harness used to measure perceived latency — last syllable of the interviewer's question to the first visible token in the copilot's UI — across:

- [Mirly](https://www.mirly.co.uk)
- [Final Round AI](https://www.finalroundai.com)
- [Cluely](https://cluely.com)
- [Parakeet AI](https://www.parakeet-ai.com)
- [LockedIn AI](https://www.lockedinai.com)
- [Sensei AI](https://www.senseicopilot.com)
- [Verve AI](https://www.vervecopilot.com)

The data published here is the source of the results posted on [mirly.co.uk/latency](https://www.mirly.co.uk/latency) and the analysis post at [mirly.co.uk/blog/latency-teardown-6-copilots](https://www.mirly.co.uk/blog/latency-teardown-6-copilots).

## Why this exists

Every vendor in this category publishes a latency number. None are comparable:

| Vendor | Public claim | What it measures |
| --- | --- | --- |
| LockedIn AI | 116 ms | LLM token-generation only |
| Final Round AI | "real-time" | no number |
| Parakeet AI | "instant" | no number |
| Cluely | <300 ms | cache-best-case |
| Sensei AI | nothing published | — |
| Mirly | <150 ms p50 | full pipeline, end-to-end |

To compare them honestly, someone has to run them all through the same harness on the same machine with the same audio. This is that harness.

## Headline result (2026-05-15 run)

Warm p50, milliseconds from last syllable to first visible token:

| Tool | p50 | p95 | Cold-start | Vendor version |
| --- | ---: | ---: | ---: | --- |
| **Mirly** | **127** | **189** | 412 | 0.0.1 |
| Parakeet AI | 421 | 690 | 1,210 | 3.0 |
| LockedIn AI | 478 | 820 | 1,560 | 1.8 |
| Verve AI | 581 | 970 | 1,520 | 1.6 |
| Cluely | 612 | 1,184 | 1,920 | 2.4 |
| Sensei AI | 718 | 1,030 | 1,470 | 2.2 |
| Final Round AI | 1,810 | 2,940 | 3,820 | 4.1 |

Raw per-run data: [`data/runs-2026-05-15.csv`](data/runs-2026-05-15.csv).

## Methodology

- **Machine**: MacBook Air M2, 16 GB RAM, macOS 14.5, plugged in, single-app foreground
- **Network**: gigabit ethernet, London (deliberate worst-case for US-East-hosted vendors)
- **Audio source**: pre-recorded 16 kHz mono WAV, 12.4 seconds, played into system audio via [BlackHole](https://github.com/ExistentialAudio/BlackHole) so every copilot receives the same bytes
- **Question text**: *"Tell me about a time you led a contentious technical decision."*
- **Metric**: time from the **last syllable** of the question (measured against the WAV's timestamp) to the **first visible token** in the copilot's UI
- **Capture**: 60 fps screen recording (QuickTime), frame-counted with [`harness/count-frames.mjs`](harness/count-frames.mjs)
- **Runs**: 10 per tool — 1 cold + 9 warm; `p50 = median(warm)`; `p95 = nth-percentile-rank(warm)`
- **Date of run**: 2026-05-15

The audio file is [`audio/question-behavioural-12s.wav`](audio/question-behavioural-12s.wav). Drop it into your own DAW or BlackHole to reproduce.

## Reproduce in 30 minutes

1. Install [BlackHole](https://github.com/ExistentialAudio/BlackHole) (free, MIT)
2. Set BlackHole as the system audio output **and** input device
3. Open QuickTime → New Screen Recording → set Microphone to BlackHole
4. For each vendor: install, sign in, start a session, press Play on the WAV, stop the recording when the copilot finishes streaming
5. Run `node harness/count-frames.mjs path/to/recording.mov` — it prompts for the frame index of (a) the last-syllable cue and (b) the first visible token, prints the delta in ms
6. Append the row to `data/runs-<date>.csv`

A full vendor sweep takes ~3 hours. The harness is intentionally low-tech — every step is auditable.

## Open questions / known caveats

- **One question type.** Behavioural. Coding and technical-deep-dive questions stress the LLM differently. Per-category benchmarks scheduled for the 2026-Q3 run.
- **One machine.** Apple Silicon M2. Intel Mac + Windows runs in flight.
- **One geography.** London. US-East candidates should see lower absolute numbers for US-hosted competitors; relative ordering should hold.
- **No coding-interview screen-capture latency** — the OCR step in Parakeet / Final Round is a separate measurement and isn't included here.

## Quarterly re-runs

This benchmark is re-run on the **15th of February, May, August, and November** each year. Diffs are published in the [`data/`](data/) directory. The repository is the source of truth; the marketing site quotes it.

## Maintainer

Manu Mahadheer — manu@wayanerd.co.uk. Filing an issue with diff numbers from your own machine is the best way to call BS on anything in here.

## Licence

[MIT](LICENSE). Use the harness, cite the dataset, run your own benchmarks. Pull requests welcome — especially additional vendors and additional question types.
