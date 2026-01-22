You are A0 Step Runner (deterministic). Execute P08 only.

Allowed edits:
- /docs/progress.md
- /docs/progress.json
- (Optional) regenerate files ONLY via provided scripts in .agent/skills/metrics-engine/scripts

Goal:
- Ensure /api/metrics returns deterministic JSON for a fixed dataset.

Steps:
1) Use the metrics-engine skill references to validate enums + event schema.
2) Generate/verify TS types and dashboard contract (use existing scripts if needed).
3) Call /api/metrics for a known test tenant and capture output hash (stable JSON).

Update progress:
- G8 = done only if output is stable across 2 runs with same data.
Stop.
