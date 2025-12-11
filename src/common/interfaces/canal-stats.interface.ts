export interface CanalStats {
  leads: number;
  ventes: number;
  conversionRate: number;
}

export interface RepartitionResult {
  oldRepartition: Record<string, number>;
  newRepartition: Record<string, number>;
  stats: Record<string, CanalStats>;
  scores?: Record<string, number>;
}

