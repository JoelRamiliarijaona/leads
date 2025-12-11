import { Injectable, NotFoundException } from '@nestjs/common';
import { CampaignsRepository } from './campaigns.repository';
import { LeadRepartitionService } from '../lead-repartition/lead-repartition.service';
import { RepartitionConfig } from '../common/interfaces/repartition-config.interface';
import { RepartitionResult } from '../common/interfaces/canal-stats.interface';

@Injectable()
export class CampaignsService {
  constructor(
    private repository: CampaignsRepository,
    private repartitionService: LeadRepartitionService,
  ) {}

  async calculateAndUpdateRepartition(
    uuid: string,
    config?: RepartitionConfig,
  ): Promise<RepartitionResult> {
    // 1. Récupérer la campagne
    const campaign = await this.repository.findById(uuid);
    if (!campaign) {
      throw new NotFoundException(`Campaign ${uuid} not found`);
    }

    // 2. Récupérer les stats
    const stats = await this.repository.getCampaignStats(uuid);

    // 3. Récupérer la répartition actuelle et arrondir
    const currentRepartitionRaw =
      (campaign.lead_canal_repartition as Record<string, number>) || {};
    const currentRepartition: Record<string, number> = {};
    for (const key in currentRepartitionRaw) {
      currentRepartition[key] = Math.round(currentRepartitionRaw[key] * 100) / 100;
    }

    // 4. Calculer les scores
    const scores = this.repartitionService.calculateScores(stats, config);

    // 5. Calculer la nouvelle répartition
    const newRepartition = this.repartitionService.calculateNewRepartition(
      stats,
      currentRepartition,
      config,
    );

    // 6. Mettre à jour dans la base de données
    await this.repository.updateRepartition(uuid, newRepartition);

    return {
      oldRepartition: currentRepartition,
      newRepartition,
      stats,
      scores,
    };
  }

  async previewRepartition(
    uuid: string,
    config?: RepartitionConfig,
  ): Promise<RepartitionResult> {
    const campaign = await this.repository.findById(uuid);
    if (!campaign) {
      throw new NotFoundException(`Campaign ${uuid} not found`);
    }

    const stats = await this.repository.getCampaignStats(uuid);
    const currentRepartitionRaw =
      (campaign.lead_canal_repartition as Record<string, number>) || {};
    const currentRepartition: Record<string, number> = {};
    for (const key in currentRepartitionRaw) {
      currentRepartition[key] = Math.round(currentRepartitionRaw[key] * 100) / 100;
    }

    const scores = this.repartitionService.calculateScores(stats, config);
    const newRepartition = this.repartitionService.calculateNewRepartition(
      stats,
      currentRepartition,
      config,
    );

    return {
      oldRepartition: currentRepartition,
      newRepartition,
      stats,
      scores,
    };
  }

  async getCampaignStats(uuid: string) {
    const campaign = await this.repository.findById(uuid);
    if (!campaign) {
      throw new NotFoundException(`Campaign ${uuid} not found`);
    }

    const stats = await this.repository.getCampaignStats(uuid);
    const currentRepartitionRaw =
      (campaign.lead_canal_repartition as Record<string, number>) || {};
    const currentRepartition: Record<string, number> = {};
    for (const key in currentRepartitionRaw) {
      currentRepartition[key] = Math.round(currentRepartitionRaw[key] * 100) / 100;
    }

    return {
      campaignUuid: uuid,
      stats,
      currentRepartition,
    };
  }

  async updateRepartitionManually(
    uuid: string,
    repartition: Record<string, number>,
  ) {
    const campaign = await this.repository.findById(uuid);
    if (!campaign) {
      throw new NotFoundException(`Campaign ${uuid} not found`);
    }

    // Valider que la somme fait 100%
    const total = Object.values(repartition).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 100) > 0.01) {
      throw new Error('La somme des pourcentages doit être égale à 100%');
    }

    await this.repository.updateRepartition(uuid, repartition);

    return {
      campaignUuid: uuid,
      repartition,
    };
  }

  async findAll(filters?: { status?: string; limit?: number; offset?: number }) {
    return this.repository.findAll(filters);
  }

  async updateLeads(
    uuid: string,
    updates: { canal?: string; source?: string },
  ) {
    const campaign = await this.repository.findById(uuid);
    if (!campaign) {
      throw new NotFoundException(`Campaign ${uuid} not found`);
    }

    const result = await this.repository.updateLeads(uuid, updates);

    return {
      campaignUuid: uuid,
      updatedCount: result.count,
      updates,
    };
  }

  async updateLeadsWithSources(uuid: string, canal: string = 'email') {
    const campaign = await this.repository.findById(uuid);
    if (!campaign) {
      throw new NotFoundException(`Campaign ${uuid} not found`);
    }

    const result = await this.repository.updateLeadsWithSources(uuid, canal);

    return {
      campaignUuid: uuid,
      ...result,
    };
  }
}

