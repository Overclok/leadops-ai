Execute P01 (Deterministic). Goal: pin Node toolchain + prepare deterministic dependency strategy WITHOUT installing deps.

Allowed edits:

- /.nvmrc (new)
- /apps/web/package.json (ONLY add engines field; do not modify deps/scripts)
- /apps/web/README.md (ONLY update deterministic install instructions)
- /docs/progress.md
- /docs/progress.json

Forbidden:

- Running npm install / npm ci / builds
- Editing any other files

Steps:

1. Create /.nvmrc at repo root with EXACT content:
   24.13.0
   Rationale: Node v24 is Active LTS; v24.13.0 is current “Latest LTS”. Record this in progress evidence.

2. Update /apps/web/package.json:
   - Add this top-level field (leave everything else unchanged):
     "engines": { "node": "24.13.0" }

   Notes:
   - Do NOT change dependencies.
   - Do NOT add packageManager unless explicitly requested later.

3. Update /apps/web/README.md to enforce deterministic installs:
   - First-time setup (only once): `npm install` to generate package-lock.json
   - After lock exists: ALWAYS use `npm ci`
   - Add a warning: do not use `npm install` once lock is committed unless intentionally changing deps.

4. Update /docs/progress.json gate statuses/evidence:
   - G1 remains PENDING (because lockfile missing), but:
     - remove blocking reason “Missing .nvmrc”
     - add evidence lines: ".nvmrc pinned to 24.13.0", "package.json engines pinned"
   - Append a run entry into runs[]: date/time Europe/Rome, what changed, and recommended next step "P02".

5. Update /docs/progress.md:
   - In snapshot, add evidence for G1 that toolchain is pinned.
   - Append Run log entry noting P01 completed and next = P02.

Output in chat:

- Confirm created/edited files (paths)
- Confirm G1 is still pending ONLY because package-lock.json is missing
- Next step id: P02

Stop.
