import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Server } from 'socket.io';

@Injectable()
export class VotesService {
  private io: Server | null = null;

  constructor(private readonly prisma: PrismaService) {}

  setSocketServer(io: Server) {
    this.io = io;
  }

  async castVote({ userId, candidateId, electionId }: { userId: string; candidateId: string; electionId: string }) {
    // Get election type
    const election = await this.prisma.election.findUnique({ where: { id: electionId } });
    if (!election) throw new BadRequestException('Election not found');

    // Ensure one vote per user per election type
    const existingVote = await this.prisma.vote.findFirst({
      where: {
        userId,
        electionId,
      },
    });
    if (existingVote) throw new ForbiddenException('You have already voted in this election');

    // Create vote
    const vote = await this.prisma.vote.create({
      data: { userId, candidateId, electionId },
    });

    // Emit real-time update
    if (this.io) {
      this.io.emit('voteUpdate', { electionId });
    }

    return vote;
  }
} 