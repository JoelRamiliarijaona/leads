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
    const campaign = await this.repository.findById(uuid);
    if (!campaign) {
      throw new NotFoundException(`Campaign ${uuid} not found`);
    }

    const stats = await this.repository.getCampaignStats(uuid);

    const configData = campaign.configs?.data as any;
    const tauxConversionGlobalFromDb = 
      configData?.tauxConversionGlobal || 
      (campaign.configs?.average_sales_rate ? (1 / (campaign.configs.average_sales_rate || 1000)) : undefined);

    const totalLeads = campaign.lead_count || 0;
    const statsTotalLeads = Object.values(stats).reduce((sum, stat) => sum + (stat.leads || 0), 0);
    const nbrDeLead = totalLeads > 0 ? totalLeads : statsTotalLeads;

    const tauxConversionGlobal = config?.tauxConversionGlobal ?? tauxConversionGlobalFromDb ?? 0.001;

    const finalConfig: RepartitionConfig = {
      ...config,
      poidsVente: config?.poidsVente ?? 1,
      tauxConversionGlobal,
      poidsLead: config?.poidsLead ?? tauxConversionGlobal * nbrDeLead,
    };

    const currentRepartitionRaw =
      (campaign.lead_canal_repartition as Record<string, number>) || {};
    const currentRepartition: Record<string, number> = {};
    for (const key in currentRepartitionRaw) {
      currentRepartition[key] = Math.round(currentRepartitionRaw[key] * 100) / 100;
    }

    const scores = this.repartitionService.calculateScores(stats, finalConfig);

    const newRepartition = this.repartitionService.calculateNewRepartition(
      stats,
      currentRepartition,
      finalConfig,
    );

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

    const configData = campaign.configs?.data as any;
    const tauxConversionGlobalFromDb = 
      configData?.tauxConversionGlobal || 
      (campaign.configs?.average_sales_rate ? (1 / (campaign.configs.average_sales_rate || 1000)) : undefined);

    const totalLeads = campaign.lead_count || 0;
    const statsTotalLeads = Object.values(stats).reduce((sum, stat) => sum + (stat.leads || 0), 0);
    const nbrDeLead = totalLeads > 0 ? totalLeads : statsTotalLeads;

    const tauxConversionGlobal = config?.tauxConversionGlobal ?? tauxConversionGlobalFromDb ?? 0.001;

    const finalConfig: RepartitionConfig = {
      ...config,
      poidsVente: config?.poidsVente ?? 1,
      tauxConversionGlobal,
      poidsLead: config?.poidsLead ?? tauxConversionGlobal * nbrDeLead,
    };

    const currentRepartitionRaw =
      (campaign.lead_canal_repartition as Record<string, number>) || {};
    const currentRepartition: Record<string, number> = {};
    for (const key in currentRepartitionRaw) {
      currentRepartition[key] = Math.round(currentRepartitionRaw[key] * 100) / 100;
    }

    const scores = this.repartitionService.calculateScores(stats, finalConfig);
    const newRepartition = this.repartitionService.calculateNewRepartition(
      stats,
      currentRepartition,
      finalConfig,
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

