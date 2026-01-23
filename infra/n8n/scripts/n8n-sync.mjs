#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ----------------------------------------------------------------------------
// Configuration & Validation
// ----------------------------------------------------------------------------

const BASE_URL = process.env.N8N_BASE_URL;
const API_KEY = process.env.N8N_API_KEY;
const APPLY = process.env.APPLY === 'true';

// Safety check: Explicit verification of required env vars
if (!BASE_URL || !API_KEY) {
    console.error('Error: Mising Environment Variables.');
    console.error('Please set N8N_BASE_URL and N8N_API_KEY.');
    console.error('Example:');
    console.error('  export N8N_BASE_URL=https://n8n.example.com');
    console.error('  export N8N_API_KEY=your_api_key_here');
    process.exit(1);
}

// Safety check: Prevent operations unless APPLY=true is explicit
if (!APPLY) {
    // We are in DRY_RUN mode by default
}

const WORKFLOWS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../workflows');

// ----------------------------------------------------------------------------
// Helper: n8n REST API
// ----------------------------------------------------------------------------

async function n8nRequest(endpoint, method = 'GET', body = null) {
    const url = `${BASE_URL.replace(/\/$/, '')}${endpoint}`;
    const headers = {
        'X-N8N-API-KEY': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
        // Security: Do not leak full body if it contains sensitive info, but usually errors are safe.
        // We check specifically for 401/403 to give clear hints.
        if (res.status === 401 || res.status === 403) {
            throw new Error(`Auth failed (${res.status}). Verify N8N_API_KEY.`);
        }
        const text = await res.text();
        throw new Error(`Request failed: ${method} ${endpoint} -> ${res.status} ${res.statusText} (${text.substring(0, 300)})`);
    }

    // 204 No Content
    if (res.status === 204) return null;

    return await res.json();
}

// ----------------------------------------------------------------------------
// Main Logic
// ----------------------------------------------------------------------------

async function main() {
    // 1. Read Local Workflows
    // -----------------------
    const localWorkflows = new Map();
    try {
        const files = await fs.readdir(WORKFLOWS_DIR);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        for (const file of jsonFiles) {
            const filePath = path.join(WORKFLOWS_DIR, file);
            const content = await fs.readFile(filePath, 'utf-8');

            try {
                const wf = JSON.parse(content);
                if (!wf.name) {
                    console.error(`Error: Workflow file "${file}" is missing 'name' property.`);
                    process.exit(1);
                }
                // Deterministic identity: Name is the primary key.
                localWorkflows.set(wf.name, { ...wf, _filename: file });
            } catch (e) {
                console.error(`Error parsing JSON in "${file}": ${e.message}`);
                process.exit(1);
            }
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.warn(`Warning: Directory not found: ${WORKFLOWS_DIR}`);
        } else {
            console.error('Fatal Local Read Error:', err);
            process.exit(1);
        }
    }

    // 2. Fetch Remote Workflows
    // -------------------------
    const remoteWorkflows = new Map();
    let cursor = null;

    // Safety: Limit loop to avoid infinite pagination
    let pageCount = 0;
    const MAX_PAGES = 50;

    try {
        do {
            pageCount++;
            const query = cursor ? `?limit=250&cursor=${cursor}` : '?limit=250';
            const data = await n8nRequest(`/api/v1/workflows${query}`);

            // Handle both array (older versions) or { data: [], nextCursor } structure
            const list = Array.isArray(data) ? data : (data.data || []);
            const nextCursor = !Array.isArray(data) ? data.nextCursor : null;

            for (const wf of list) {
                // Enforce name as primary key
                // Usage note: If remote has multiple workflows with same name, we pick the LAST one found (or arbitrary)
                // ideally we would warn.
                if (remoteWorkflows.has(wf.name)) {
                    // Keep existing, but maybe warn?
                    // We'll just overwrite map entry, effectively picking one.
                }
                remoteWorkflows.set(wf.name, wf);
            }
            cursor = nextCursor;
            if (pageCount > MAX_PAGES) break;
        } while (cursor);
    } catch (err) {
        console.error(`Fatal Remote Fetch Error: ${err.message}`);
        process.exit(1);
    }

    // 3. Generate Plan
    // ----------------
    // Get all unique names from local (we only sync local -> remote)
    const sortedNames = Array.from(localWorkflows.keys()).sort();
    const plan = [];

    for (const name of sortedNames) {
        const localWf = localWorkflows.get(name);
        const remoteWf = remoteWorkflows.get(name);

        if (remoteWf) {
            plan.push({ type: 'UPDATE', name, id: remoteWf.id, data: localWf });
        } else {
            plan.push({ type: 'CREATE', name, data: localWf });
        }
    }

    // 4. Output Plan (Deterministic Format)
    // -------------------------------------
    // Sort plan by name (already sorted by key iteration, but ensuring correctness)
    // Plan format: CREATE <name>, UPDATE <name>, SKIP <name>

    if (!APPLY) {
        // DRY RUN MODE
        if (plan.length === 0) {
            // Nothing to do
        } else {
            plan.forEach(item => {
                console.log(`${item.type} ${item.name}`);
            });
        }
        // Exit 0 for success
        process.exit(0);
    }

    // 5. Apply Changes
    // ----------------
    console.log(`Applying ${plan.length} changes...`);

    for (const item of plan) {
        const { type, name, id, data } = item;
        // Remove internal meta keys if any
        const { _filename, ...payload } = data;

        // Ensure settings exist to satisfy API validation
        if (!payload.settings) {
            payload.settings = { executionOrder: 'v1' };
        }

        try {
            if (type === 'CREATE') {
                const created = await n8nRequest('/api/v1/workflows', 'POST', payload);
                console.log(`CREATED ${name} (ID: ${created.id})`);
            } else if (type === 'UPDATE') {
                // PATCH /workflows/{id}
                await n8nRequest(`/api/v1/workflows/${id}`, 'PUT', payload);
                console.log(`UPDATED ${name} (ID: ${id})`);
            }
        } catch (err) {
            console.error(`FAILED to ${type} "${name}": ${err.message}`);
            process.exit(1);
        }
    }

    console.log('Sync complete.');
}

main().catch(err => {
    console.error('Unexpected Error:', err);
    process.exit(1);
});
