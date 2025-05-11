import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Server } from 'socket.io';

function validateQuestions(questions: any): boolean {
  if (!Array.isArray(questions)) return false;
  for (const q of questions) {
    if (typeof q.question !== 'string' || !Array.isArray(q.options)) return false;
    if (!q.options.every((o: any) => typeof o === 'string')) return false;
  }
  return true;
}

@Injectable()
export class SurveysService {
  private io: Server | null = null;

  constructor(private readonly prisma: PrismaService) {}

  setSocketServer(io: Server) {
    this.io = io;
  }

  async createSurvey(data: { question: string; options: string[] }) {
    if (!data.question || !Array.isArray(data.options) || !data.options.every((o: any) => typeof o === 'string')) {
      throw new BadRequestException('Invalid survey data. | Taarifa za utafiti si sahihi.');
    }
    const survey = await this.prisma.survey.create({ data });
    this.io?.emit('surveyUpdate', { action: 'create', survey });
    return survey;
  }

  async findAllSurveys() {
    return this.prisma.survey.findMany();
  }

  async findSurveyById(id: string) {
    const survey = await this.prisma.survey.findUnique({ where: { id } });
    if (!survey) throw new NotFoundException('Survey not found. | Utafiti haujapatikana.');
    return survey;
  }

  async updateSurvey(id: string, data: Partial<{ question: string; options: string[] }>) {
    if (data.options && !Array.isArray(data.options)) {
      throw new BadRequestException('Invalid options. | Chaguzi si sahihi.');
    }
    const survey = await this.prisma.survey.update({ where: { id }, data });
    this.io?.emit('surveyUpdate', { action: 'update', survey });
    return survey;
  }

  async deleteSurvey(id: string) {
    const survey = await this.prisma.survey.findUnique({ where: { id } });
    if (!survey) throw new NotFoundException('Survey not found. | Utafiti haujapatikana.');
    await this.prisma.survey.delete({ where: { id } });
    this.io?.emit('surveyUpdate', { action: 'delete', survey });
    return { message: 'Survey deleted. | Utafiti umefutwa.' };
  }

  async submitResponse(userId: string, surveyId: string, answer: string) {
    const survey = await this.prisma.survey.findUnique({ where: { id: surveyId } });
    if (!survey) throw new NotFoundException('Survey not found. | Utafiti haujapatikana.');
    if (!survey.options.includes(answer)) {
      throw new BadRequestException('Invalid answer. | Jibu si sahihi.');
    }
    return this.prisma.surveyResponse.create({ data: { userId, surveyId, answer } });
  }

  async getResponses(surveyId: string) {
    return this.prisma.surveyResponse.findMany({ where: { surveyId } });
  }
} 