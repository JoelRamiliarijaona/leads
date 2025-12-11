import { Injectable } from '@nestjs/common';
import {
  RepartitionConfig,
  DEFAULT_REPARTITION_CONFIG,
} from '../common/interfaces/repartition-config.interface';
import { CanalStats } from '../common/interfaces/canal-stats.interface';

@Injectable()
export class LeadRepartitionService {
  private calculatePerformanceScore(
    leads: number,
    ventes: number,
    config: Required<RepartitionConfig>,
  ): number {
    if (leads === 0) return 0;

    const tauxConversion = ventes / leads;

    const scoreConversion = tauxConversion / config.tauxConversionGlobal;

    const scoreVolume = Math.log(leads + 1) / Math.log(1000);

    const score =
      config.poidsVente * scoreConversion + config.poidsLead * scoreVolume;

    return score;
  }

  calculateScores(
    stats: Record<string, CanalStats>,
    config?: RepartitionConfig,
  ): Record<string, number> {
    const finalConfig = { ...DEFAULT_REPARTITION_CONFIG, ...config };
    const canaux = Object.keys(stats);
    const scores: Record<string, number> = {};

    for (const canal of canaux) {
      const { leads = 0, ventes = 0 } = stats[canal] || {};
      const score = this.calculatePerformanceScore(
        leads,
        ventes,
        finalConfig,
      );
      scores[canal] = Math.round(score * 100) / 100;
    }

    return scores;
  }

  calculateNewRepartition(
    stats: Record<string, CanalStats>,
    currentRepartition: Record<string, number>,
    config?: RepartitionConfig,
  ): Record<string, number> {
    const finalConfig = { ...DEFAULT_REPARTITION_CONFIG, ...config };
    const canaux = Object.keys(stats);

    const scores: Record<string, number> = {};
    let totalScore = 0;

    for (const canal of canaux) {
      const { leads = 0, ventes = 0 } = stats[canal] || {};
      scores[canal] = this.calculatePerformanceScore(
        leads,
        ventes,
        finalConfig,
      );
      totalScore += scores[canal];
    }

    if (totalScore === 0) {
      return currentRepartition;
    }

    const idealRepartition: Record<string, number> = {};
    for (const canal of canaux) {
      idealRepartition[canal] = (scores[canal] / totalScore) * 100;
    }

    const newRepartition: Record<string, number> = {};
    for (const canal of canaux) {
      const current =
        currentRepartition[canal] || 100 / canaux.length;
      const ideal = idealRepartition[canal];

      newRepartition[canal] =
        current + finalConfig.smoothingFactor * (ideal - current);
    }

    const total = Object.values(newRepartition).reduce(
      (sum, val) => sum + val,
      0,
    );
    for (const canal of canaux) {
      newRepartition[canal] = (newRepartition[canal] / total) * 100;
    }

    const roundedRepartition: Record<string, number> = {};
    for (const canal of canaux) {
      roundedRepartition[canal] = Math.round(newRepartition[canal] * 100) / 100;
    }

    return roundedRepartition;
  }
}

