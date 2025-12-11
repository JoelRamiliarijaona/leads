import { Module } from '@nestjs/common';
import { LeadRepartitionService } from './lead-repartition.service';

@Module({
  providers: [LeadRepartitionService],
  exports: [LeadRepartitionService],
})
export class LeadRepartitionModule {}

