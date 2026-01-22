
# Metrics

## KPI
- Email inviate / risposte / senza risposta
- Chiamate fatte / ricevute
- Appuntamenti (email/telefono) + cancellati
- Deal opened / won / lost
- Campagne
- Prodotti/servizi venduti + ranking “più caldi”

## Regola EMAIL_SENZA_RISPOSTA (scelta)
- dopo **5 giorni di calendario** dall’ultimo EMAIL_SENT associato a quel lead/thread
- se non esiste EMAIL_REPLIED successivo
- genera evento derivato EMAIL_NO_REPLY (idempotency_key deterministico)
