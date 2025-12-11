import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsNumber, Min, Max, ValidateBy, ValidationOptions } from 'class-validator';

export class UpdateRepartitionDto {
  @ApiProperty({
    description: 'Répartition des leads par canal (en pourcentage). La somme doit être égale à 100%',
    example: { facebook: 60, instagram: 40 },
  })
  @IsObject()
  repartition: Record<string, number>;
}

