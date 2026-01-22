#!/usr/bin/env python3
import json, os

here = os.path.dirname(__file__)
ref_dir = os.path.join(os.path.dirname(here), "references")
repo_root = os.path.abspath(os.path.join(here, "../../../.."))
out_dir = os.path.join(repo_root, "apps", "web", "src", "lib", "generated")
os.makedirs(out_dir, exist_ok=True)

with open(os.path.join(ref_dir, "enums.json"), "r", encoding="utf-8") as f:
    enums = json.load(f)

def ts_union(vals):
    return " | ".join([json.dumps(v) for v in vals])

enums_ts = [
    "/* AUTO-GENERATED. DO NOT EDIT MANUALLY. */",
    "export type EventType = " + ts_union(enums["event_type"]) + ";",
    "export type LeadStatus = " + ts_union(enums["lead_status"]) + ";",
    "export type Source = " + ts_union(enums["source"]) + ";",
    "export type Channel = " + ts_union(enums["channel"]) + ";",
    "export type ErrorCode = " + ts_union(enums["error_code"]) + ";",
    ""
]
with open(os.path.join(out_dir, "enums.ts"), "w", encoding="utf-8") as f:
    f.write("\n".join(enums_ts))

event_types_ts = [
    "/* AUTO-GENERATED. DO NOT EDIT MANUALLY. */",
    "import type { EventType } from './enums';",
    "export const EVENT_TYPES: readonly EventType[] = " + json.dumps(enums["event_type"], ensure_ascii=False) + " as const;",
    ""
]
with open(os.path.join(out_dir, "eventTypes.ts"), "w", encoding="utf-8") as f:
    f.write("\n".join(event_types_ts))

print("OK generated:", out_dir)
