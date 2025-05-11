import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Candidate, ElectionType } from '@prisma/client';
import { Server } from 'socket.io';

@Injectable()
export class CandidatesService {
  private io: Server | null = null;

  constructor(private readonly prisma: PrismaService) {}

  setSocketServer(io: Server) {
    this.io = io;
  }

  async create(data: { name: string; party: string; position: ElectionType; constituency?: string; electionId: string }) {
    if (!data.name || !data.party || !data.position || !data.electionId) {
      throw new BadRequestException('Name, party, position, and electionId are required. | Jina, chama, nafasi, na electionId vinahitajika.');
    }
    if (!Object.values(ElectionType).includes(data.position)) {
      throw new BadRequestException('Invalid position. | Nafasi si sahihi.');
    }
    if (data.position === 'COUNCILLOR' && !data.constituency) {
      throw new BadRequestException('Constituency required for councillor. | Kata inahitajika kwa diwani.');
    }
    const candidate = await this.prisma.candidate.create({ data });
    this.io?.emit('candidateUpdate', { action: 'create', candidate });
    return candidate;
  }

  async findAll(position?: ElectionType) {
    if (position && !Object.values(ElectionType).includes(position)) {
      throw new BadRequestException('Invalid position. | Nafasi si sahihi.');
    }
    return this.prisma.candidate.findMany({
      where: position ? { position } : {},
    });
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });
    if (!candidate) throw new NotFoundException('Candidate not found. | Mgombea hakupatikana.');
    return candidate;
  }

  async update(id: string, data: Partial<{ name: string; party: string; position: ElectionType; constituency?: string }>) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });
    if (!candidate) throw new NotFoundException('Candidate not found. | Mgombea hakupatikana.');
    if (data.position && !Object.values(ElectionType).includes(data.position)) {
      throw new BadRequestException('Invalid position. | Nafasi si sahihi.');
    }
    if (data.position === 'COUNCILLOR' && !data.constituency) {
      throw new BadRequestException('Constituency required for councillor. | Kata inahitajika kwa diwani.');
    }
    const updated = await this.prisma.candidate.update({ where: { id }, data });
    this.io?.emit('candidateUpdate', { action: 'update', candidate: updated });
    return updated;
  }

  async remove(id: string) {
    const candidate = await this.prisma.candidate.findUnique({ where: { id } });
    if (!candidate) throw new NotFoundException('Candidate not found. | Mgombea hakupatikana.');
    await this.prisma.candidate.delete({ where: { id } });
    this.io?.emit('candidateUpdate', { action: 'delete', candidate });
    return { message: 'Candidate deleted. | Mgombea ameondolewa.' };
  }
} 