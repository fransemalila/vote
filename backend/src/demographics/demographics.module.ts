import { Module } from '@nestjs/common';
import { DemographicsService } from './demographics.service';
import { DemographicsController } from './demographics.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DemographicsController],
  providers: [DemographicsService, PrismaService],
})
export class DemographicsModule {} 