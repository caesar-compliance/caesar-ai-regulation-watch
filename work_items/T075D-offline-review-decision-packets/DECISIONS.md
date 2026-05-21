# T075D — Decisions

1. **Packet per candidate** — One offline decision packet per review candidate; deterministic `packet_created_at` for reproducible exports.
2. **Packet status** — `blocked_no_supabase` when DB health is `not_configured`; otherwise `ready_for_operator_triage` for pending fixture candidates.
3. **Placeholders only** — `decision_placeholders.selected_placeholder` always `false`; not persisted; no legal conclusion text.
4. **Runtime status** — `source_pilot_decision_packets_ready` signals offline packet export; does not imply live monitoring, Supabase connected, or source verified.
5. **No version bump** — T075D branch only; merge/release/deploy per Control Tower.
