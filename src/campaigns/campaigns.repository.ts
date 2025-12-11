import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CanalStats } from '../common/interfaces/canal-stats.interface';

@Injectable()
export class CampaignsRepository {
  constructor(private prisma: PrismaService) {}

  async findById(uuid: string) {
    return this.prisma.campaigns.findUnique({
      where: { uuid },
    });
  }

  async updateRepartition(
    uuid: string,
    repartition: Record<string, number>,
  ) {
    // Calculer shoot_canal_repartition basé sur les canaux (email/SMS) dans lead_campaigns
    const canalStats = await this.prisma.lead_campaigns.groupBy({
      by: ['canal'],
      where: { campaign_uuid: uuid },
      _count: {
        canal: true,
      },
    });

    const totalLeads = await this.prisma.lead_campaigns.count({
      where: { campaign_uuid: uuid },
    });

    // Calculer la répartition des shoots (emails/SMS)
    const shootRepartition: Record<string, number> = {};
    if (totalLeads > 0) {
      canalStats.forEach((stat) => {
        if (stat.canal) {
          const percentage = (stat._count.canal / totalLeads) * 100;
          shootRepartition[stat.canal] = Math.round(percentage * 100) / 100;
        }
      });
    } else {
      // Si aucun lead, garder la répartition par défaut (email: 100%)
      shootRepartition['email'] = 100;
    }

    // Normaliser pour que la somme fasse 100%
    const totalShoot = Object.values(shootRepartition).reduce((sum, val) => sum + val, 0);
    if (totalShoot > 0) {
      for (const canal in shootRepartition) {
        shootRepartition[canal] = Math.round((shootRepartition[canal] / totalShoot) * 100 * 100) / 100;
      }
    }

    // Calculer total_needs_lead (somme des pourcentages de lead_canal_repartition = 100, donc total_needs_lead reste à 100)
    // Ou on peut le calculer différemment selon la logique métier
    // Pour l'instant, on garde la valeur actuelle ou on la recalcule si nécessaire
    const currentCampaign = await this.findById(uuid);
    const totalNeedsLead = currentCampaign?.total_needs_lead || 100;

    return this.prisma.campaigns.update({
      where: { uuid },
      data: {
        lead_canal_repartition: repartition as any,
        shoot_canal_repartition: shootRepartition as any,
        total_needs_lead: totalNeedsLead,
        updated_at: new Date(),
      },
    });
  }

  async getCampaignStats(uuid: string): Promise<Record<string, CanalStats>> {
    // Mettre à jour les lead_campaigns qui ont canal vide ou null en leur assignant "email"
    // Note: 'canal' dans lead_campaigns = canal de communication (email pour l'instant)
    //       'source' dans lead_campaigns = source du lead (facebook/instagram, etc.)
    // Utilisation d'une requête SQL brute pour gérer les cas null et chaînes vides
    await this.prisma.$executeRaw`
      UPDATE lead_campaigns 
      SET canal = 'email' 
      WHERE campaign_uuid = ${uuid}::uuid 
      AND (canal IS NULL OR canal = '')
    `;

    // Récupérer les stats groupées par source (Facebook/Instagram, etc.)
    const stats = await this.prisma.lead_campaigns.groupBy({
      by: ['source'],
      where: { 
        campaign_uuid: uuid,
        source: { not: null }, // Exclure les sources null
      },
      _count: {
        source: true,
      },
    });

    // Récupérer les ventes (succeed = true) par source
    const ventes = await this.prisma.lead_campaigns.groupBy({
      by: ['source'],
      where: {
        campaign_uuid: uuid,
        succeed: true,
        source: { not: null },
      },
      _count: {
        source: true,
      },
    });

    // Construire le résultat
    const result: Record<string, CanalStats> = {};

    for (const stat of stats) {
      const venteCount = ventes.find((v) => v.source === stat.source)?._count?.source || 0;
      const leadCount = stat._count.source || 0;
      const conversionRate = leadCount > 0 ? venteCount / leadCount : 0;

      result[stat.source] = {
        leads: leadCount,
        ventes: venteCount,
        // Arrondir le taux de conversion à 4 décimales (pour avoir une précision suffisante)
        conversionRate: Math.round(conversionRate * 10000) / 10000,
      };
    }

    return result;
  }

  async findAll(filters?: { status?: string; limit?: number; offset?: number }) {
    const where = filters?.status ? { status: filters.status } : {};
    const take = filters?.limit || 10;
    const skip = filters?.offset || 0;

    const [campaigns, total] = await Promise.all([
      this.prisma.campaigns.findMany({
        where,
        take,
        skip,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.campaigns.count({ where }),
    ]);

    return { campaigns, total };
  }

  async updateLeads(
    campaignUuid: string,
    updates: { canal?: string; source?: string },
  ) {
    // Mettre à jour tous les leads de la campagne avec les valeurs fournies
    const updateData: any = {};
    if (updates.canal !== undefined) {
      updateData.canal = updates.canal;
    }
    if (updates.source !== undefined) {
      updateData.source = updates.source;
    }

    if (Object.keys(updateData).length === 0) {
      return { count: 0 };
    }

    return this.prisma.lead_campaigns.updateMany({
      where: { campaign_uuid: campaignUuid },
      data: updateData,
    });
  }

  async updateLeadsWithSources(
    campaignUuid: string,
    canal: string = 'email',
  ) {
    // Récupérer tous les leads de la campagne
    const leads = await this.prisma.lead_campaigns.findMany({
      where: { campaign_uuid: campaignUuid },
      orderBy: { date: 'asc' },
    });

    if (leads.length === 0) {
      return { count: 0, message: 'Aucun lead trouvé pour cette campagne' };
    }

    // Mettre à jour le premier lead avec facebook, le deuxième avec instagram, etc.
    const sources = ['facebook', 'instagram'];
    let updatedCount = 0;

    for (let i = 0; i < leads.length; i++) {
      const source = sources[i % sources.length]; // Alterner entre facebook et instagram
      
      await this.prisma.lead_campaigns.update({
        where: { uuid: leads[i].uuid },
        data: {
          canal,
          source,
        },
      });
      updatedCount++;
    }

    return { count: updatedCount, message: `${updatedCount} leads mis à jour` };
  }
}

