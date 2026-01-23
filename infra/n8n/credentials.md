# n8n Credentials Checklist

Questo documento elenca le credenziali **OBBLIGATORIE** da configurare nella UI di n8n prima di attivare i workflow.
I nomi devono corrispondere esattamente per garantire il determinismo dei nodi.

## 1. Google (Gmail API)

- **Nome Credenziale in n8n**: `Google Gmail OAuth2 Account` (o `LeadOpsAI - Gmail OAuth`)
- **Tipo**: `gmailOAuth2`
- **Scope Richiesti**:
    - `https://www.googleapis.com/auth/gmail.readonly` (Lettura email)
    - `https://www.googleapis.com/auth/gmail.send` (Invio reply)
    - `https://www.googleapis.com/auth/gmail.modify` (Labeling/Archiviazione)
- **Setup**:
    1.  Crea progetto in Google Cloud Console.
    2.  Abilita **Gmail API**.
    3.  Crea credenziali OAuth 2.0 (Web Application).
    4.  Redirect URI: `https://[TUA-ISTANZA-N8N]/rest/oauth2-credential/callback`
    5.  Copia Client ID e Client Secret in n8n.
- **Verifica**:
    - Crea un workflow di test -> Nodo Gmail -> Resource: `Message` -> Operation: `GetAll` -> Limit: 1.
    - Esegui (Execute Node). Deve tornare JSON verde.

## 2. Calendly

- **Nome Credenziale in n8n**: `Calendly OAuth2 API`
- **Tipo**: `calendlyOAuth2Api`
- **Scope**: (Default di Calendly)
- **Setup**:
    1.  Vai su [Calendly Developer Portal](https://developer.calendly.com/).
    2.  Registra app.
    3.  Redirect URI: `https://[TUA-ISTANZA-N8N]/rest/oauth2-credential/callback`
    4.  Usa Client ID e Secret in n8n.
- **Webhook Note**:
    - Il workflow `calendly_adapter` usa il "Calendly Trigger" node che gestisce il webhook automaticamente.
    - Assicurati che n8n sia raggiungibile pubblicamente.

## 3. Vapi (Voice AI)

- **Nome Credenziale in n8n**: `Vapi API`
- **Tipo**: `headerAuth` (Custom) o `vapiApi` (se disponibile nativamente, altrimenti Header Auth con `Authorization: Bearer <token>`)
    - *Nota*: Se usi il workflow template standard Vapi, spesso usa Header Auth.
    - **Header Name**: `Authorization`
    - **Value**: `Bearer <tuo-vapi-private-key>`
- **Setup**:
    1.  Dashboard Vapi -> Org -> API Keys.
    2.  Crea Private Key.

## 4. Twilio (Opzionale / Fallback)

- **Nome Credenziale in n8n**: `Twilio API`
- **Tipo**: `twilioApi`
- **Dati**:
    - Account SID
    - Auth Token
- **Setup**:
    1.  Twilio Console -> Dashboard.

---

## Regole di Sicurezza

1.  **MAI** committare questi valori nel repo.
2.  Questa configurazione vive SOLO nel database di n8n (o nei suoi volumi criptati).
3.  Esegui sempre un "Test Connection" (se disponibile) o un'esecuzione di prova prima di attivare i workflow.
