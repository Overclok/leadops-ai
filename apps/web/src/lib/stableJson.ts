/**
 * Canonical, deterministic JSON stringify.
 * - Objects: keys sorted lexicographically
 * - Arrays: order preserved
 * - Primitives: JSON.stringify default
 *
 * NOTE: This MUST stay in sync with the n8n SignRequest Function node
 * in infra/n8n/workflows/*_adapter.json.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function canonicalize(value: unknown): unknown {
  if (value === null) return null;
  const t = typeof value;
  if (t === "number" || t === "string" || t === "boolean") return value;

  if (Array.isArray(value)) return value.map(canonicalize);

  // Dates should already be ISO strings; if not, serialize... but avoid Date objects.
  if (t === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) {
      const v = obj[k];
      // Drop undefined keys (JSON.stringify does this anyway, but we do it explicitly)
      if (v === undefined) continue;
      out[k] = canonicalize(v);
    }
    return out;
  }

  // functions / symbols are not JSON; drop them
  return null;
}
