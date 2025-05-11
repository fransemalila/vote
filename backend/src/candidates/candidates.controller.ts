import { Body, Controller, Get, Param, Post, Patch, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Request } from 'express';
import { ElectionType } from '@prisma/client';

class CreateCandidateDto {
  name: string;
  party: string;
  position: string;
  constituency?: string;
  electionId: string;
}

class UpdateCandidateDto {
  name?: string;
  party?: string;
  position?: string;
  constituency?: string;
}

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @UseGuards(JwtAuthGuard, RoleGuard('ADMIN'))
  @Post()
  async create(@Body() dto: CreateCandidateDto) {
    const data = { ...dto, position: dto.position as ElectionType };
    return this.candidatesService.create(data);
  }

  @Get()
  async findAll(@Query('position') position?: string) {
    return this.candidatesService.findAll(position as any);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard('ADMIN'))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCandidateDto) {
    const data = { ...dto, position: dto.position as ElectionType };
    return this.candidatesService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RoleGuard('ADMIN'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.candidatesService.remove(id);
  }
} 