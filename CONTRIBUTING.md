# Contributing

The fastest way to call BS on this benchmark is to re-run it on your own hardware and file an issue with diff numbers.

## Adding a vendor

1. Install the copilot. Sign up, take the free trial, run a session.
2. Follow the methodology in [`README.md`](README.md#methodology) verbatim — same machine, same WAV, same metric.
3. Add ten rows to `data/runs-<today>.csv`: 1 cold + 9 warm, frame-counted at 60 fps.
4. PR the CSV addition. Include:
   - Vendor name + version tested
   - Screen recording of one warm + one cold run (host on YouTube/Vimeo/R2 — too large for the repo)
   - Any per-vendor caveats (e.g. "this vendor returns a placeholder spinner before the real first token; we counted the first real token")

## Adding a question type

Behavioural is the current category. Coding-interview, technical-deep-dive, and "tell me about yourself" stress the pipeline differently.

To add a category:

1. Author a new WAV in `audio/` with the same recording standard (16 kHz mono, single speaker).
2. Re-run every vendor for the new question.
3. Add a per-category section in `README.md` with the new headline table.

## Disputing a number

File an issue with:

- Vendor + version
- Date of your run + machine + network
- The screen recording (URL)
- Frame-count math

We re-run the affected cell within 7 days; if your number is reproducible the published row updates with a `disputed` flag and the prior number kept in `data/history/`.

## Code of conduct

Vendor employees are explicitly welcome to PR corrections, version updates, and methodology critique. Personal attacks, undisclosed conflicts, or hand-wavy "but our internal numbers say…" without raw data will be closed without comment.
