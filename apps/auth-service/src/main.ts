import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.AUTH_SERVICE_PORT ?? '3003'),
    },
  });

  await app.listen();
  console.log(`Authorization service listening on port ${process.env.AUTH_SERVICE_PORT ?? 3003}`);
}
bootstrap();