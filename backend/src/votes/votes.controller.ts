import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

class CastVoteDto {
  candidateId: string;
  electionId: string;
}

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('cast')
  async castVote(@Req() req: Request, @Body() dto: CastVoteDto) {
    // user info is attached by JwtStrategy
    const user = req.user as { userId: string };
    return this.votesService.castVote({
      userId: user.userId,
      candidateId: dto.candidateId,
      electionId: dto.electionId,
    });
  }
} 