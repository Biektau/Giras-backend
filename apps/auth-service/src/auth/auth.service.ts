import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from './user-role.enum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly userRepository: Repository<User>;
  private readonly refreshTokenRepository: Repository<RefreshToken>;

  constructor(
    @Inject('DATA_SOURCE') private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.userRepository = this.dataSource.getRepository(User);
    this.refreshTokenRepository = this.dataSource.getRepository(RefreshToken);
  }

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    const adminName = this.configService.get<string>('ADMIN_NAME', 'Admin');

    if (!adminEmail || !adminPassword) {
      console.warn(
        'ADMIN_EMAIL или ADMIN_PASSWORD не заданы в .env — админ не создан',
      );
      return;
    }

    const existing = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existing) {
      console.log('Админ уже существует');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = this.userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: UserRole.ADMIN,
    });

    await this.userRepository.save(admin);
    console.log('Админ создан успешно');
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new RpcException({
        statusCode: 409,
        message: 'Пользователь с таким email уже существует',
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: UserRole.USER,
    });

    await this.userRepository.save(user);
    return this.generateTokens(user);
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new RpcException({
        statusCode: 401,
        message: 'Неверный email или пароль',
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: 401,
        message: 'Неверный email или пароль',
      });
    }

    return this.generateTokens(user);
  }

  async refresh(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken) {
      throw new RpcException({
        statusCode: 401,
        message: 'Refresh token не найден',
      });
    }

    if (refreshToken.expiresAt < new Date()) {
      await this.refreshTokenRepository.remove(refreshToken);
      throw new RpcException({
        statusCode: 401,
        message: 'Refresh token истёк',
      });
    }

    await this.refreshTokenRepository.remove(refreshToken);
    return this.generateTokens(refreshToken.user);
  }

  async logout(token: string): Promise<{ message: string }> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
    });
    if (refreshToken) {
      await this.refreshTokenRepository.remove(refreshToken);
    }
    return { message: 'Выход выполнен успешно' };
  }

  async validateToken(
    accessToken: string,
  ): Promise<{ id: string; role: UserRole }> {
    try {
      const payload = this.jwtService.verify(accessToken, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
      return { id: payload.sub, role: payload.role };
    } catch {
      throw new RpcException({ statusCode: 401, message: 'Невалидный токен' });
    }
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );

    const refreshTokenValue = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const refreshToken = this.refreshTokenRepository.create({
      token: refreshTokenValue,
      expiresAt,
      user,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return { accessToken, refreshToken: refreshTokenValue };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanExpiredTokens() {
    const result = await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();

    console.log(`Удалено истёкших токенов: ${result.affected}`);
  }
}
