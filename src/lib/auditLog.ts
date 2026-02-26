import { supabase } from "@/integrations/supabase/client";

export type AuditEventType = 
  | "segmentation_edit"
  | "dose_plan_change"
  | "ai_recommendation"
  | "report_generated"
  | "plan_approved"
  | "scenario_selected";

export type AuditCategory = "segmentation" | "planning" | "ai" | "report" | "approval";

export async function logAuditEvent(params: {
  eventType: AuditEventType;
  eventCategory: AuditCategory;
  patientId: string;
  description: string;
  aiModelVersion?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const { error } = await supabase.from("audit_logs").insert([{
      event_type: params.eventType,
      event_category: params.eventCategory,
      patient_id: params.patientId,
      description: params.description,
      ai_model_version: params.aiModelVersion ?? null,
      metadata: (params.metadata ?? {}) as unknown as Record<string, string>,
    }]);
    if (error) console.error("Audit log error:", error);
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}
