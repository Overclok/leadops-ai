#!/usr/bin/env python3
import json, os

cards = [
  {"key":"email_sent","label":"Email inviate","description":"Totale outbound inviate","primary_metric":"email_sent"},
  {"key":"email_replied","label":"Email con risposta","description":"Risposte umane ricevute","primary_metric":"email_replied"},
  {"key":"email_no_reply","label":"Email senza risposta","description":"Outbound senza reply dopo 5 giorni","primary_metric":"email_no_reply"},
  {"key":"calls_outbound","label":"Chiamate fatte","description":"Chiamate outbound avviate","primary_metric":"calls_outbound"},
  {"key":"calls_inbound","label":"Chiamate ricevute","description":"Chiamate inbound ricevute","primary_metric":"calls_inbound"},
  {"key":"meetings_total","label":"Appuntamenti","description":"Meeting prenotati (email+telefono)","primary_metric":"meetings_total"},
  {"key":"deals_won","label":"Chiuso vinto","description":"Deal vinti nel periodo","primary_metric":"deals_won"},
  {"key":"deals_lost","label":"Chiuso perso","description":"Deal persi nel periodo","primary_metric":"deals_lost"}
]

filters = [
  {"key":"period","type":"enum","values":["daily","weekly","monthly"],"default":"weekly"},
  {"key":"agent_id","type":"string","optional":True},
  {"key":"campaign_id","type":"uuid","optional":True},
  {"key":"product_service_id","type":"uuid","optional":True}
]

tables = [
  {"key":"leads","columns":["name","company","status","agent_id","last_activity_at"]},
  {"key":"products","columns":["name","score","sold","interested"]},
  {"key":"errors","columns":["occurred_at","source","error_code","details","retryable"]}
]

contract = {"version":1,"kpi_cards":cards,"filters":filters,"tables":tables}

repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
out_path = os.path.join(repo_root, "docs", "dashboard.contract.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(contract, f, ensure_ascii=False, indent=2)
print("OK:", out_path)
