import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CandidatesService } from '../candidates/candidates.service';
import { SurveysService } from '../surveys/surveys.service';
import { Server } from 'socket.io';

@Injectable()
export class AdminService {
  private io: Server | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly candidatesService: CandidatesService,
    private readonly surveysService: SurveysService,
  ) {}

  setSocketServer(io: Server) {
    this.io = io;
    this.candidatesService.setSocketServer(io);
    this.surveysService.setSocketServer(io);
  }

  // Candidate management (reuse CandidatesService)
  createCandidate(dto: any) { return this.candidatesService.create(dto); }
  findAllCandidates(position?: string) { return this.candidatesService.findAll(position as any); }
  findCandidate(id: string) { return this.candidatesService.findOne(id); }
  updateCandidate(id: string, dto: any) { return this.candidatesService.update(id, dto); }
  removeCandidate(id: string) { return this.candidatesService.remove(id); }

  // Voter management
  async listVoters() {
    return this.prisma.user.findMany({ where: { isAdmin: false } });
  }
  async updateVoter(id: string, data: Partial<{ name: string; phone: string; nationalId: string; passwordHash: string }>) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Voter not found. | Mpiga kura hajapatikana.');
    const updated = await this.prisma.user.update({ where: { id }, data });
    this.io?.emit('adminUpdate', { action: 'updateVoter', user: updated });
    return updated;
  }
  async removeVoter(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Voter not found. | Mpiga kura hajapatikana.');
    await this.prisma.user.delete({ where: { id } });
    this.io?.emit('adminUpdate', { action: 'deleteVoter', user });
    return { message: 'Voter deleted. | Mpiga kura ameondolewa.' };
  }

  // Survey management (reuse SurveysService)
  createSurvey(dto: any) { return this.surveysService.createSurvey(dto); }
  findAllSurveys() { return this.surveysService.findAllSurveys(); }
  updateSurvey(id: string, dto: any) { return this.surveysService.updateSurvey(id, dto); }
  deleteSurvey(id: string) { return this.surveysService.deleteSurvey(id); }

  // Analytics
  async getAnalytics() {
    // Voter turnout by position
    const votes = await this.prisma.vote.findMany({ include: { election: true } });
    const turnout: Record<string, number> = {};
    for (const v of votes) {
      const pos = v.election.type;
      turnout[pos] = (turnout[pos] || 0) + 1;
    }
    // Demographics
    const demographics = await this.prisma.demographics.findMany();
    // Donations
    const donations = await this.prisma.donation.findMany();
    const totalDonations = donations.reduce((sum: number, d: any) => sum + d.amount, 0);
    return {
      turnout,
      demographics,
      totalDonations,
    };
  }
} 