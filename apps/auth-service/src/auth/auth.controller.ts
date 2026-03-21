import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @MessagePattern({ cmd: 'get_me' })
  getMe(@Payload() id: string) {
    return this.authService.getMe(id);
  }

  @MessagePattern({ cmd: 'register' })
  register(@Payload() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @MessagePattern({ cmd: 'login' })
  login(@Payload() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @MessagePattern({ cmd: 'refresh' })
  refresh(@Payload() token: string) {
    return this.authService.refresh(token);
  }

  @MessagePattern({ cmd: 'logout' })
  logout(@Payload() token: string) {
    return this.authService.logout(token);
  }

  @MessagePattern({ cmd: 'validate_token' })
  validateToken(@Payload() accessToken: string) {
    return this.authService.validateToken(accessToken);
  }
}