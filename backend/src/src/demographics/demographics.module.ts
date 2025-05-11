import { Module } from '@nestjs/common';
import { DemographicsController } from './demographics.controller';
import { DemographicsService } from './demographics.service';

@Module({
  controllers: [DemographicsController],
  providers: [DemographicsService]
})
export class DemographicsModule {}
