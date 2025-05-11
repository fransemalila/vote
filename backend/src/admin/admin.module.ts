import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CandidatesService } from '../candidates/candidates.service';
import { SurveysService } from '../surveys/surveys.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, CandidatesService, SurveysService],
})
export class AdminModule {} 