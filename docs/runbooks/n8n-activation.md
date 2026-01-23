# Runbook: Attivazione n8n (Strict Order)

Questo runbook definisce la procedura deterministica per attivare l'ambiente n8n ed i suoi workflow senza generare dati sporchi.

## 1. Prerequisiti (STOP HERE se non soddisfatti)
- [ ] Workflow JSON importati (`gmail_adapter`, `calendly_adapter`, ecc.)
- [ ] Istanza n8n running e raggiungibile.
- [ ] API Next.js (`/api/events`) pronta ad accettare eventi firmati.

## 2. Fase A: Configurazione Credenziali
**Obiettivo**: Autenticare n8n verso provider esterni.

1.  Apri n8n UI > Credentials.
2.  Segui `infra/n8n/credentials.md` per creare:
    - Gmail OAuth2
    - Calendly OAuth2
    - Vapi API Key
3.  **TEST**: Per ognuna, esegui un test di connessione o un nodo di prova "Get".
    - *Se fallisce*: NON procedere. Fixa la credenziale.

## 3. Fase B: Tenant Bootstrap
**Obiettivo**: Ottenere identità e chiavi crittografiche del tenant target.

1.  Loggati nella Web App LeadOps (es. `https://app.leadops.ai` o localhost).
2.  Vai su `/dashboard` o chiana `/api/tenant` (autenticato).
3.  Ottieni/Copia:
    - `tenant_id` (es. `tnt_...`)
    - `webhook_secret` (generato per la firma eventi server-to-server).
4.  Salva questi valori nel Password Manager (NON nel codice).

## 4. Fase C: Runtime Config Update
**Obiettivo**: Iniettare variabili d'ambiente in n8n.

1.  Nel pannello di controllo n8n (Docker/Easypanel), imposta le *Environment Variables*:
    - `TENANT_ID` = `[VALORE]`
    - `WEBHOOK_SECRET` = `[VALORE]`
    - `LEADOPS_API_BASE_URL` = `https://[APP_DOMAIN]`
2.  Riavvia container n8n se necessario (per applicare env vars).
3.  **Verify**: Esegui workflow di debug: `return $env.TENANT_ID` -> deve mostrare il valore.

## 5. Fase D: E2E Synthetic Test (Smoke Test)
**Obiettivo**: Verificare che n8n possa scrivere nel DB LeadOps.

1.  Crea un workflow manuale "Smoke Test" in n8n:
    - **Trigger**: Manual
    - **Function**: Crea payload JSON fake:
      ```json
      {
        "type": "SYSTEM_TEST",
        "data": { "message": "hello world" },
        "timestamp": "..."
      }
      ```
    - **HMAC Sign**: Usa `$env.WEBHOOK_SECRET` per firmare.
    - **HTTP Request**: POST a `$env.LEADOPS_API_BASE_URL/api/events`.
2.  Esegui.
3.  **Verifica lato App**:
    - Controlla tabella `events` nel DB Supabase.
    - Controlla che `/api/metrics` (o dashboard) rifletta +1 evento (se applicabile).
    - Se ricevi 401/403: Il `WEBHOOK_SECRET` non matcha o l'algoritmo di firma è errato. **STOP**.

## 6. Fase E: Attivazione Workflows (Sequenziale)
Attiva un workflow alla volta e osserva logs.

1.  **test_gmail_adapter**:
    - *Config*: Poll mode (es. ogni 10 min) o Webhook (se Push).
    - *Azione*: Mandati una mail di test.
    - *Verifica*: Evento `EMAIL_RECEIVED` in DB.
    - *Attiva*: Switch "Active".

2.  **calendly_adapter**:
    - *Azione*: Prenota evento fake su Calendly.
    - *Verifica*: Evento `MEETING_BOOKED` in DB.
    - *Attiva*.

3.  **vapi_adapter**:
    - *Azione*: Fai chiamata simulata.
    - *Verifica*: Evento `CALL_COMPLETED` in DB.
    - *Attiva*.

4.  **derive_no_reply** (Scheduler):
    - *Attiva* per ultimo. Questo controlla eventi passati.

## Rollback Plan
Se i metriche impazziscono o arrivano duplicati massivi:
1.  Disattiva TUTTI i workflow in n8n UI (Switch Off).
2.  Analizza `error_logs` in Supabase e `Executions` in n8n.
3.  Fixa la logica o le credenziali.
4.  Ricomincia da Fase D (Test Sintetico).
