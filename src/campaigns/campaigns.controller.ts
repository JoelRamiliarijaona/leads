import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { RepartitionConfigDto } from '../lead-repartition/dto/repartition-config.dto';
import { UpdateRepartitionDto } from './dto/update-repartition.dto';
import { RepartitionResultDto } from './dto/repartition-result.dto';
import { UpdateLeadsDto } from './dto/update-leads.dto';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post(':uuid/repartition/calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculer et mettre à jour la répartition des leads' })
  @ApiParam({ name: 'uuid', description: 'UUID de la campagne' })
  @ApiResponse({ status: 200, type: RepartitionResultDto })
  @ApiResponse({ status: 404, description: 'Campagne non trouvée' })
  async calculateRepartition(
    @Param('uuid') uuid: string,
    @Body() config: RepartitionConfigDto,
  ) {
    return this.campaignsService.calculateAndUpdateRepartition(uuid, config);
  }

  @Post(':uuid/repartition/preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Prévisualiser la nouvelle répartition sans sauvegarder' })
  @ApiParam({ name: 'uuid', description: 'UUID de la campagne' })
  @ApiResponse({ status: 200, type: RepartitionResultDto })
  @ApiResponse({ status: 404, description: 'Campagne non trouvée' })
  async previewRepartition(
    @Param('uuid') uuid: string,
    @Body() config: RepartitionConfigDto,
  ) {
    return this.campaignsService.previewRepartition(uuid, config);
  }

  @Get(':uuid/stats')
  @ApiOperation({ summary: 'Obtenir les statistiques d\'une campagne' })
  @ApiParam({ name: 'uuid', description: 'UUID de la campagne' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Campagne non trouvée' })
  async getCampaignStats(@Param('uuid') uuid: string) {
    return this.campaignsService.getCampaignStats(uuid);
  }

  @Patch(':uuid/repartition')
  @ApiOperation({ summary: 'Mettre à jour manuellement la répartition' })
  @ApiParam({ name: 'uuid', description: 'UUID de la campagne' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Campagne non trouvée' })
  @ApiResponse({ status: 400, description: 'Somme des pourcentages invalide' })
  async updateRepartition(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateRepartitionDto,
  ) {
    return this.campaignsService.updateRepartitionManually(uuid, dto.repartition);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les campagnes' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre de résultats', type: Number })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset pour la pagination', type: Number })
  @ApiResponse({ status: 200 })
  async findAll(
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.campaignsService.findAll({
      status,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Patch(':uuid/leads')
  @ApiOperation({ 
    summary: 'Mettre à jour les leads d\'une campagne',
    description: 'Met à jour tous les leads d\'une campagne avec canal="email" et source alternée (facebook/instagram)',
  })
  @ApiParam({ name: 'uuid', description: 'UUID de la campagne' })
  @ApiResponse({ status: 200, description: 'Leads mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Campagne non trouvée' })
  async updateLeads(
    @Param('uuid') uuid: string,
    @Body() dto: UpdateLeadsDto,
  ) {
    if (dto.canal && dto.source) {
      return this.campaignsService.updateLeads(uuid, {
        canal: dto.canal,
        source: dto.source,
      });
    }
    
    return this.campaignsService.updateLeadsWithSources(uuid, dto.canal || 'email');
  }
}

