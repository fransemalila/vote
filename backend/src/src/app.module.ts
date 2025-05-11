import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { VotesModule } from './votes/votes.module';
import { ResultsModule } from './results/results.module';
import { CandidatesModule } from './candidates/candidates.module';
import { DemographicsModule } from './demographics/demographics.module';
import { SurveysModule } from './surveys/surveys.module';
import { DonationsModule } from './donations/donations.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    VotesModule,
    ResultsModule,
    CandidatesModule,
    DemographicsModule,
    SurveysModule,
    DonationsModule,
    AdminModule,
    // Add other modules here (e.g., AuthModule, PrismaModule, etc.)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
