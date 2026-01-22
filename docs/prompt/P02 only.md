You are A0 Step Runner (deterministic). Execute P02 only.

Allowed edits:
- /docs/progress.md
- /docs/progress.json
- apps/web/package-lock.json (generated)
- apps/web/node_modules/ (local artifact; do not commit guidance)

Commands to run:
1) cd apps/web
2) npm install
3) npm run build
4) npm test (if present)

Validation rules:
- If package-lock.json is created and build succeeds: set G1 = done, G4 = done (build-based).
- If build fails: record error summary in progress log and mark G4 = blocked with reason.

Stop after updating progress files. Do NOT change app code in this step.
