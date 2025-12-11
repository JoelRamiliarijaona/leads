import { Injectable } from '@nestjs/common';
import {
  RepartitionConfig,
  DEFAULT_REPARTITION_CONFIG,
} from '../common/interfaces/repartition-config.interface';
import { CanalStats } from '../common/interfaces/canal-stats.interface';

@Injectable()
export class LeadRepartitionService {
  /**
   * Calcule le score de performance d'un canal
   */
  private calculatePerformanceScore(
    leads: number,
    ventes: number,
    config: Required<RepartitionConfig>,
  ): number {
    if (leads === 0) return 0;

    const tauxConversion = ventes / leads;

    // Score basé sur le taux de conversion (normalisé par rapport au taux global)
    const scoreConversion = tauxConversion / config.tauxConversionGlobal;

    // Score basé sur le volume de leads (normalisation logarithmique)
    const scoreVolume = Math.log(leads + 1) / Math.log(1000);

    // Score combiné avec les poids
    const score =
      config.poidsVente * scoreConversion + config.poidsLead * scoreVolume;

    return score;
  }

  /**
   * Calcule les scores de performance pour chaque canal
   */
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
      // Arrondir à 2 décimales
      scores[canal] = Math.round(score * 100) / 100;
    }

    return scores;
  }

  /**
   * Calcule la nouvelle répartition basée sur les performances
   */
  calculateNewRepartition(
    stats: Record<string, CanalStats>,
    currentRepartition: Record<string, number>,
    config?: RepartitionConfig,
  ): Record<string, number> {
    const finalConfig = { ...DEFAULT_REPARTITION_CONFIG, ...config };
    const canaux = Object.keys(stats);

    // Calculer les scores de performance pour chaque canal
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

    // Si aucun score, garder la répartition actuelle
    if (totalScore === 0) {
      return currentRepartition;
    }

    // Calculer la répartition idéale basée sur les scores
    const idealRepartition: Record<string, number> = {};
    for (const canal of canaux) {
      idealRepartition[canal] = (scores[canal] / totalScore) * 100;
    }

    // Appliquer l'adoucissement (smoothing) pour éviter les changements brusques
    const newRepartition: Record<string, number> = {};
    for (const canal of canaux) {
      const current =
        currentRepartition[canal] || 100 / canaux.length;
      const ideal = idealRepartition[canal];

      // Formule d'adoucissement : nouveau = ancien + facteur * (idéal - ancien)
      newRepartition[canal] =
        current + finalConfig.smoothingFactor * (ideal - current);
    }

    // Normaliser pour que la somme fasse 100%
    const total = Object.values(newRepartition).reduce(
      (sum, val) => sum + val,
      0,
    );
    for (const canal of canaux) {
      newRepartition[canal] = (newRepartition[canal] / total) * 100;
    }

    // Arrondir à 2 décimales
    const roundedRepartition: Record<string, number> = {};
    for (const canal of canaux) {
      roundedRepartition[canal] = Math.round(newRepartition[canal] * 100) / 100;
    }

    // Retourner avec les scores séparés
    return roundedRepartition;
  }
}

