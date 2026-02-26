
-- Audit log table for CE/MDR compliance
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'segmentation_edit', 'dose_plan_change', 'ai_recommendation', 'report_generated', 'plan_approved'
  event_category TEXT NOT NULL, -- 'segmentation', 'planning', 'ai', 'report', 'approval'
  patient_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT 'Kliniker',
  ai_model_version TEXT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read/write for now (no auth yet)
CREATE POLICY "Allow public read audit logs"
  ON public.audit_logs FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Index for fast patient lookups
CREATE INDEX idx_audit_logs_patient ON public.audit_logs(patient_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
