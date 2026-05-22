-- T081 — Additive review queue / operator workflow columns (optional; not applied by default).
-- Safe for local dev only. No drops, no destructive changes.

ALTER TABLE IF EXISTS review_candidates
  ADD COLUMN IF NOT EXISTS review_status text DEFAULT 'review_required',
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS operator_decision_id uuid;

COMMENT ON COLUMN review_candidates.review_status IS
  'T081 operator workflow: review_required | in_review | dismissed | accepted_for_tracking | needs_source_check';

CREATE TABLE IF NOT EXISTS operator_review_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES review_candidates(id),
  decision text NOT NULL,
  reviewer_label text NOT NULL,
  decided_at timestamptz NOT NULL DEFAULT now(),
  rationale text,
  public_visibility text NOT NULL DEFAULT 'internal_summary_only',
  verified_on_source boolean NOT NULL DEFAULT false,
  client_use_allowed boolean NOT NULL DEFAULT false,
  client_evidence_allowed boolean NOT NULL DEFAULT false,
  final_evidence_allowed boolean NOT NULL DEFAULT false,
  legal_change_claimed boolean NOT NULL DEFAULT false,
  publication_allowed boolean NOT NULL DEFAULT false,
  public_export_allowed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE operator_review_decisions IS
  'T081 local operator triage — gates default false; not legal advice.';
