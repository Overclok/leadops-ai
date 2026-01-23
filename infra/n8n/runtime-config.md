# n8n Runtime Configuration

Queste variabili devono essere definite a livello di **Environment Variables** (Docker/Easypanel) o **n8n Global Variables** affinché i workflow funzionino in modo deterministico tra development e produzione.

Non modificare i nodi del workflow per hardcodare questi valori.

## Variabili d'Ambiente (Docker / `.env`)

Queste variabili sono lette dai nodi tramite espressioni (es. `{{ $env.LEADOPS_API_BASE_URL }}`) o usate dai trigger.

| Nome Variabile | Esempio Valore | Descrizione |
| :--- | :--- | :--- |
| `LEADOPS_API_BASE_URL` | `https://api.leadops.ai` | URL base dell'API Next.js per inviare gli eventi (`/api/events`). In locale può essere `http://host.docker.internal:3000`. |
| `TENANT_ID` | `tnt_123456` | ID del tenant principale per cui questo n8n lavora. Incluso nel payload degli eventi. |
| `WEBHOOK_SECRET` | `whsec_...` | Segreto per firmare gli eventi inviati a `/api/events`. Deve corrispondere a quello salvato nel database del tenant. |
| `GENERATE_SOURCEMAP` | `false` | Ottimizzazione Node (opzionale). |

## Configurazione Webhook (Trigger)

I workflow `vapi_adapter` e `calendly_adapter` espongono webhook path specifici. Questi sono definiti nei workflow JSON ma dipendono dall'URL pubblico di n8n.

- **Webhook URL Base**: `https://[N8N_DOMAIN]/webhook`
- **Percorsi Attesi**:
    - Vapi: `/webhook/vapi/call-status`
    - Calendly: gestito internamente dal nodo Trigger (ma verifica callback URL).

## Injection Strategy

1.  **Easypanel / Docker**:
    - Inserisci queste variabili nella sezione "Environment" del servizio n8n.
    - `LEADOPS_API_BASE_URL`
    - `TENANT_ID`
    - `WEBHOOK_SECRET`

2.  **Verifica**:
    - Crea un workflow temporaneo con un nodo "Set" che esegue `{{ $env.LEADOPS_API_BASE_URL }}`.
    - Verifica che stampi il valore corretto.

## Note su `WEBHOOK_SECRET`

Questo secret è CRITICO.
1.  Viene generato lato **LeadOps App** (quando si crea/bootstrappa il tenant).
2.  Va copiato in **n8n Env**.
3.  Il workflow usa un nodo "Crypto" o "Function" per generare l'HMAC `x-ag-signature` usando questo secret.
4.  Se non corrispondono, `/api/events` rifiuterà l'evento (401/403).
