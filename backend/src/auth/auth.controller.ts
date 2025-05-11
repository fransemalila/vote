import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, UserRole } from './auth.service';

class RegisterDto {
  name: string;
  phone: string;
  nationalId: string;
  password: string;
  role: UserRole;
}

class LoginDto {
  phone: string;
  password: string;
}

class TwoFADto {
  phone: string;
}

class Verify2FADto {
  phone: string;
  code: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('send-2fa')
  async send2FA(@Body() dto: TwoFADto) {
    return this.authService.send2FACode(dto.phone);
  }

  @Post('verify-2fa')
  async verify2FA(@Body() dto: Verify2FADto) {
    return this.authService.verify2FACode(dto.phone, dto.code);
  }
} 