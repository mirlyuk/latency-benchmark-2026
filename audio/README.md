# audio/

The benchmark prompt:

> "Tell me about a time you led a contentious technical decision."

## v1 — synthesised (current)

`question-behavioural-12s.wav` is generated on macOS via:

```sh
say -v Daniel -r 175 -o /tmp/q.aiff "Tell me about a time you led a contentious technical decision."
afconvert -f WAVE -d LEI16@16000 -c 1 /tmp/q.aiff question-behavioural-12s.wav
```

- Voice: Daniel (British male, ships with macOS)
- Rate: 175 wpm (natural conversational pace)
- Format: 16 kHz mono, signed 16-bit little-endian — matches what every STT vendor in the benchmark consumes natively, so no resampling artefacts enter the measurement
- Duration: ~3.4 s

Why synthesised for v1: anyone re-running the benchmark on a fresh Mac can regenerate **exactly the same bytes** with one command. No recording-equipment variance, no microphone colouration, no room acoustics. The trade-off is that the cadence isn't a real interviewer's — that's measured separately in v2.

## v2 — human recording (planned 2026-Q3)

Native British-English speaker, same prompt, recorded in a quiet room at 16 kHz mono. Replaces `question-behavioural-12s.wav` at the next quarterly run. Both numbers — synth and human — published side-by-side so the delta is visible in the public history.

## Regenerate yourself

If you want to verify the bytes match:

```sh
say -v Daniel -r 175 -o /tmp/q.aiff "Tell me about a time you led a contentious technical decision."
afconvert -f WAVE -d LEI16@16000 -c 1 /tmp/q.aiff /tmp/regen.wav
shasum /tmp/regen.wav question-behavioural-12s.wav
```

The two hashes should match.
