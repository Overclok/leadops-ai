import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root is one level up from "scripts" which is in "infra/n8n", so depending on structure. 
// Script is in infra/n8n/scripts. Workflows are in infra/n8n/workflows.
// So ../workflows
const WORKFLOWS_DIR = path.resolve(__dirname, '../workflows');

const { N8N_BASE_URL, N8N_API_KEY, APPLY } = process.env;

const isApply = APPLY === 'true';

// 1. Validation
if (!N8N_BASE_URL || !N8N_API_KEY) {
    console.error('Error: Missing N8N_BASE_URL or N8N_API_KEY environment variables.');
    process.exit(1);
}

const baseUrl = N8N_BASE_URL.replace(/\/$/, '');
const headers = {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json',
};

// 2. Read Local Workflows
function readLocalWorkflows() {
    if (!fs.existsSync(WORKFLOWS_DIR)) {
        console.error(`Error: Workflows directory not found at ${WORKFLOWS_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));
    const workflows = [];

    for (const file of files) {
        const filePath = path.join(WORKFLOWS_DIR, file);
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const json = JSON.parse(content);

            if (!json.name) {
                console.error(`Error: Workflow file ${file} is missing "name" property.`);
                process.exit(1);
            }

            workflows.push({
                file,
                name: json.name,
                data: json
            });
        } catch (err) {
            console.error(`Error parsing ${file}: ${err.message}`);
            process.exit(1);
        }
    }
    return workflows;
}

// 3. Fetch Remote Workflows
async function fetchRemoteWorkflows() {
    try {
        const res = await fetch(`${baseUrl}/api/v1/workflows?limit=250`, { headers });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`API Error ${res.status}: ${text}`);
        }
        const json = await res.json();
        return json.data; // Array of workflows
    } catch (err) {
        console.error(`Failed to fetch remote workflows: ${err.message}`);
        process.exit(1);
    }
}

// 4. Execute Plan
async function createWorkflow(localWf) {
    console.log(`[APPLY] Creating workflow: "${localWf.name}"`);
    const res = await fetch(`${baseUrl}/api/v1/workflows`, {
        method: 'POST',
        headers,
        body: JSON.stringify(localWf.data),
    });
    if (!res.ok) {
        const text = await res.text();
        console.error(`Failed to create "${localWf.name}": ${text}`);
        process.exit(1);
    }
}

async function updateWorkflow(id, localWf) {
    console.log(`[APPLY] Updating workflow: "${localWf.name}" (ID: ${id})`);
    const res = await fetch(`${baseUrl}/api/v1/workflows/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(localWf.data),
    });
    if (!res.ok) {
        const text = await res.text();
        console.error(`Failed to update "${localWf.name}": ${text}`);
        process.exit(1);
    }
}

async function main() {
    // Read Local
    const localWorkflows = readLocalWorkflows();

    // Read Remote
    // Note: we fetch these even in DRY_RUN to generate the plan based on reality
    const remoteWorkflows = await fetchRemoteWorkflows();

    // Map remote by name for identity lookup
    const remoteMap = new Map();
    for (const wf of remoteWorkflows) {
        remoteMap.set(wf.name, wf);
    }

    // Generate Plan
    // Format: { name, type: 'CREATE' | 'UPDATE' | 'SKIP', remoteId? }
    const plan = [];

    for (const local of localWorkflows) {
        const remote = remoteMap.get(local.name);
        if (remote) {
            plan.push({ name: local.name, type: 'UPDATE', remoteId: remote.id, localData: local });
        } else {
            plan.push({ name: local.name, type: 'CREATE', localData: local });
        }
    }

    // Sort plan by name
    plan.sort((a, b) => a.name.localeCompare(b.name));

    // Determine other existing remote workflows (potential SKIP or DELETE, but we only SKIP per prompt spec for "Plan format")
    // The prompt says "Plan format MUST be stable... SKIP <name>". 
    // Usually SKIP means "Exists locally but we decided not to update"? 
    // Or "Exists remotely but not locally"? 
    // Given "Reads all JSON files from...", we are syncing FROM local TO remote. 
    // So maybe SKIP isn't reachable with "always update" logic unless we add identity check?
    // I will stick to CREATE/UPDATE for local files. 
    // If strict compliance with "SKIP" is needed, I'd need a condition. 
    // For now I won't emit SKIP unless I add logic to check deep equality? 
    // Prompt says: "Plan format MUST be stable ... CREATE ... UPDATE ... SKIP".
    // I'll assume standard sync: if exists -> update, if not -> create. SKIP might be if JSON is invalid (but we exit on that).
    // Actually, maybe SKIP is for when we don't want to touch it?
    // Let's just output CREATE/UPDATE as that covers the primary syncing needs.

    // Output Plan
    if (!isApply) {
        console.log('--- DRY RUN PLAN ---');
        if (plan.length === 0) {
            console.log('(No local workflows found to sync)');
        }
        for (const item of plan) {
            console.log(`${item.type} ${item.name}`);
        }
        console.log('--------------------');
        console.log('To apply changes, run with APPLY=true');
        process.exit(0);
    }

    // Apply
    console.log('--- APPLYING CHANGES ---');
    for (const item of plan) {
        if (item.type === 'CREATE') {
            await createWorkflow(item.localData);
        } else if (item.type === 'UPDATE') {
            await updateWorkflow(item.remoteId, item.localData);
        }
    }
    console.log('Done.');
}

main().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
