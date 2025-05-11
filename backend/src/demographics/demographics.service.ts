import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const VALID_REGIONS = [
  'Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Mbeya', 'Morogoro', 'Tanga', 'Kilimanjaro',
  'Tabora', 'Kagera', 'Shinyanga', 'Mtwara', 'Iringa', 'Singida', 'Ruvuma', 'Mara', 'Pwani',
  'Lindi', 'Manyara', 'Njombe', 'Geita', 'Katavi', 'Simiyu', 'Rukwa', 'Songwe',
];

@Injectable()
export class DemographicsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: { age: number; gender: string; region: string; district?: string; ward?: string }) {
    if (data.age < 18) throw new BadRequestException('Age must be 18 or older. | Umri lazima uwe miaka 18 au zaidi.');
    if (!['male', 'female', 'other'].includes(data.gender)) throw new BadRequestException('Invalid gender. | Jinsia si sahihi.');
    if (!VALID_REGIONS.includes(data.region)) throw new BadRequestException('Invalid region. | Mkoa si sahihi.');
    // Only one demographics per user
    const existing = await this.prisma.demographics.findUnique({ where: { userId } });
    if (existing) throw new BadRequestException('Demographics already submitted. | Taarifa za demografia tayari zipo.');
    return this.prisma.demographics.create({ data: { ...data, userId, district: data.district ?? '', ward: data.ward ?? '' } });
  }

  async update(userId: string, data: { age?: number; gender?: string; region?: string; district?: string; ward?: string }) {
    const existing = await this.prisma.demographics.findUnique({ where: { userId } });
    if (!existing) throw new NotFoundException('Demographics not found. | Taarifa za demografia hazijapatikana.');
    if (data.age !== undefined && data.age < 18) throw new BadRequestException('Age must be 18 or older. | Umri lazima uwe miaka 18 au zaidi.');
    if (data.gender && !['male', 'female', 'other'].includes(data.gender)) throw new BadRequestException('Invalid gender. | Jinsia si sahihi.');
    if (data.region && !VALID_REGIONS.includes(data.region)) throw new BadRequestException('Invalid region. | Mkoa si sahihi.');
    return this.prisma.demographics.update({ where: { userId }, data });
  }

  async aggregate() {
    // Aggregate by age, gender, region
    const all = await this.prisma.demographics.findMany();
    const ageGroups: Record<string, number> = {};
    const genderCounts: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    for (const d of all) {
      // Age groups
      const age = d.age;
      let group = '';
      if (age < 18) group = '<18';
      else if (age < 25) group = '18-24';
      else if (age < 35) group = '25-34';
      else if (age < 50) group = '35-49';
      else group = '50+';
      ageGroups[group] = (ageGroups[group] || 0) + 1;
      // Gender
      genderCounts[d.gender] = (genderCounts[d.gender] || 0) + 1;
      // Region
      regionCounts[d.region] = (regionCounts[d.region] || 0) + 1;
    }
    return { ageGroups, genderCounts, regionCounts };
  }

  async delete(id: string) {
    const existing = await this.prisma.demographics.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Demographics not found. | Taarifa za demografia hazijapatikana.');
    await this.prisma.demographics.delete({ where: { id } });
    return { message: 'Demographics deleted. | Taarifa za demografia zimefutwa.' };
  }
} 