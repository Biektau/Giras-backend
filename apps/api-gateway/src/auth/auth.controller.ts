import { Controller, Post, Body, Res, Req, Get, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from './guards/jwt.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Get('me')
  @UseGuards(JwtGuard)
  getMe(@CurrentUser() user: { id: string; role: string }) {
    return user;
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const tokens = await firstValueFrom(
      this.authClient.send({ cmd: 'register' }, dto),
    );
    this.setRefreshCookie(res, tokens.refreshToken);
    return res.json({ accessToken: tokens.accessToken });
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const tokens = await firstValueFrom(
      this.authClient.send({ cmd: 'login' }, dto),
    );
    this.setRefreshCookie(res, tokens.refreshToken);
    return res.json({ accessToken: tokens.accessToken });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token не найден' });
    }

    const tokens = await firstValueFrom(
      this.authClient.send({ cmd: 'refresh' }, refreshToken),
    );
    this.setRefreshCookie(res, tokens.refreshToken);
    return res.json({ accessToken: tokens.accessToken });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await firstValueFrom(
        this.authClient.send({ cmd: 'logout' }, refreshToken),
      );
    }

    res.clearCookie('refreshToken');
    return res.json({ message: 'Выход выполнен успешно' });
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}