import { CanActivate, ExecutionContext, Inject, Injectable, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Request } from "express";
import { firstValueFrom } from "rxjs";

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Токен не предоставлен');
    }

    try {
      const user = await firstValueFrom(
        this.authClient.send({ cmd: 'validate_token' }, token),
      );
      request['user'] = user;
      return true;
    } catch (error) {
      if (error?.error?.statusCode === 401) {
        throw new UnauthorizedException(error.error.message ?? 'Невалидный токен');
      }
      throw new ServiceUnavailableException('Сервис авторизации недоступен');
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}