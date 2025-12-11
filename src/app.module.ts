import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { LeadRepartitionModule } from './lead-repartition/lead-repartition.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CampaignsModule,
    LeadRepartitionModule,
  ],
})
export class AppModule {}

