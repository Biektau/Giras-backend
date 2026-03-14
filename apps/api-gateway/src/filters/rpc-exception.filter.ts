import { Catch, ArgumentsHost, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

interface RpcError {
  statusCode?: number;
  message?: string;
}

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const error = exception.getError() as RpcError | string;

    const statusCode = typeof error === 'object'
      ? (error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = typeof error === 'object'
      ? (error.message ?? 'Internal server error')
      : error;

    response.status(statusCode).json({
      statusCode,
      message,
    });
  }
}