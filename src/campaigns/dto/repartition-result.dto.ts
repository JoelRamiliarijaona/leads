import { ApiProperty } from '@nestjs/swagger';

export class CanalStatsDto {
  @ApiProperty({ example: 50 })
  leads: number;

  @ApiProperty({ example: 1 })
  ventes: number;

  @ApiProperty({ example: 0.02 })
  conversionRate: number;
}

export class RepartitionResultDto {
  @ApiProperty({ example: { facebook: 50, instagram: 50 } })
  oldRepartition: Record<string, number>;

  @ApiProperty({ example: { facebook: 64.64, instagram: 35.36 } })
  newRepartition: Record<string, number>;

  @ApiProperty({ type: 'object', additionalProperties: { $ref: '#/components/schemas/CanalStatsDto' } })
  stats: Record<string, CanalStatsDto>;

  @ApiProperty({ required: false, example: { facebook: 14.26, instagram: 0.26 } })
  scores?: Record<string, number>;
}

