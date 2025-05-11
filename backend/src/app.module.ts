import { Module } from '@nestjs/common';
import { CandidatesModule } from './candidates/candidates.module';
import { DemographicsModule } from './demographics/demographics.module';
import { DonationsModule } from './donations/donations.module';
import { ResultsModule } from './results/results.module';
import { VotesModule } from './votes/votes.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { SurveysModule } from './surveys/surveys.module';

@Module({
  imports: [
    CandidatesModule,
    DemographicsModule,
    DonationsModule,
    ResultsModule,
    VotesModule,
    AdminModule,
    AuthModule,
    SurveysModule,
  ],
})
export class AppModule {}
