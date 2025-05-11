import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async getVoteCounts(electionId: string) {
    // Count votes per candidate for a given election
    const candidates = await this.prisma.candidate.findMany({
      where: { electionId },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });
    return candidates.map((c: any) => ({
      candidateId: c.id,
      name: c.name,
      party: c.party,
      position: c.position,
      votes: c._count.votes,
    }));
  }

  async getDemographics(electionId: string) {
    // Aggregate demographics for users who voted in this election
    const votes = await this.prisma.vote.findMany({
      where: { electionId },
      select: { user: { select: { demographics: true } } },
    });
    const demographics = votes.map((v: any) => v.user.demographics).filter(Boolean);
    // Aggregate by age, gender, region
    const ageGroups: Record<string, number> = {};
    const genderCounts: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    for (const d of demographics) {
      if (!d) continue;
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
} 