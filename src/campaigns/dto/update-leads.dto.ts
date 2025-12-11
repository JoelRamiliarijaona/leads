import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum SourceType {
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
}

export class UpdateLeadsDto {
  @ApiProperty({
    description: 'Canal de communication (email pour l\'instant)',
    example: 'email',
    default: 'email',
  })
  @IsString()
  @IsOptional()
  canal?: string;

  @ApiProperty({
    description: 'Source du lead (facebook ou instagram)',
    enum: SourceType,
    example: 'facebook',
  })
  @IsEnum(SourceType)
  @IsOptional()
  source?: SourceType;
}

