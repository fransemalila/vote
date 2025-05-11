import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

export type UserRole = 'VOTER' | 'ADMIN';

@Injectable()
export class AuthService {
  private twilioClient: twilio.Twilio;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.twilioClient = twilio(
      this.config.get('TWILIO_ACCOUNT_SID'),
      this.config.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async register({ name, phone, nationalId, password, role }: { name: string; phone: string; nationalId: string; password: string; role: UserRole; }) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ phone }, { nationalId }] },
    });
    if (existing) throw new BadRequestException('User already exists');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { name, phone, nationalId, passwordHash, isAdmin: role === 'ADMIN' },
    });
    // Optionally send 2FA code here
    return user;
  }

  async login({ phone, password }: { phone: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    // Optionally send 2FA code here
    const payload = {
      sub: user.id,
      phone: user.phone,
      nationalId: user.nationalId,
      role: user.isAdmin ? 'ADMIN' : 'VOTER',
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, phone: user.phone, nationalId: user.nationalId, role: payload.role },
    };
  }

  async send2FACode(phone: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Store code in DB or cache (for demo, just return)
    await this.twilioClient.messages.create({
      body: `Your verification code is: ${code}`,
      from: this.config.get('TWILIO_PHONE_NUMBER'),
      to: phone,
    });
    // In production, store code with expiry and verify later
    return code;
  }

  async verify2FACode(phone: string, code: string) {
    // Implement code verification logic (e.g., check DB/cache)
    // For demo, always succeed
    return true;
  }
} 