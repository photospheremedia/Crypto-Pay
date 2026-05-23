import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

export async function writeAuditLog({
  tenantId,
  actorUserId,
  action,
  entityType,
  entityId,
  before,
  after,
}: {
  tenantId: string | null;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}) {
  const service = getSupabaseServiceClient();
  await service.from("audit_log").insert({
    tenant_id: tenantId,
    actor_user_id: actorUserId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    diff_json: {
      before: before ?? null,
      after: after ?? null,
    },
  });
}
