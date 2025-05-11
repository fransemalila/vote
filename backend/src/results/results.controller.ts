import { Controller, Get, Query } from '@nestjs/common';
import { ResultsService } from './results.service';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get('votes')
  async getVoteCounts(@Query('electionId') electionId: string) {
    return this.resultsService.getVoteCounts(electionId);
  }

  @Get('demographics')
  async getDemographics(@Query('electionId') electionId: string) {
    return this.resultsService.getDemographics(electionId);
  }
} 