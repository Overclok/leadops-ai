import { z } from "zod";
import type { Channel, EventType, Source } from "./generated/enums";

export const EventEnvelope = z.object({
  schema_version: z.literal(1).optional(),
  tenant_id: z.string().uuid(),
  occurred_at: z.string().datetime(),
  event_type: z.string() as unknown as z.ZodType<EventType>,
  source: z.string() as unknown as z.ZodType<Source>,
  idempotency_key: z.string().min(1).max(256),
  channel: z.string().optional() as unknown as z.ZodType<Channel | undefined>,
  agent_id: z.string().optional(),
  campaign_id: z.string().uuid().optional(),
  product_service_id: z.string().uuid().optional(),
  lead: z.object({
    match: z.object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      external_id: z.string().max(128).optional(),
    }).refine(v => !!(v.email || v.phone || v.external_id), "lead.match requires email or phone or external_id"),
    name: z.string().max(120).optional(),
    company: z.string().max(160).optional(),
  }).optional(),
  payload: z.record(z.any()),
});

export type EventEnvelope = z.infer<typeof EventEnvelope>;
