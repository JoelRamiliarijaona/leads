import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class RepartitionConfigDto {
  @ApiPropertyOptional({
    description: 'Poids des ventes dans le calcul (0-1)',
    example: 0.7,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  poidsVente?: number;

  @ApiPropertyOptional({
    description: 'Poids des leads dans le calcul (0-1)',
    example: 0.3,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  poidsLead?: number;

  @ApiPropertyOptional({
    description: 'Taux de conversion global attendu',
    example: 0.001,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tauxConversionGlobal?: number;

  @ApiPropertyOptional({
    description: 'Facteur d\'adoucissement pour éviter les changements brusques (0-1)',
    example: 0.3,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  smoothingFactor?: number;
}

