import { createClient } from '@/lib/supabase/server';

export type LogAction =
  | 'login'
  | 'logout'
  | 'request_created'
  | 'request_updated'
  | 'request_deleted'
  | 'user_role_updated'
  | 'scoring_config_updated';

export async function logActivity(params: {
  userId?: string | null;
  action: LogAction;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();
    await supabase.from('activity_logs').insert({
      user_id: params.userId ?? null,
      action: params.action,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      details: params.details ?? {},
    });
  } catch {
    // ignore log errors
  }
}
