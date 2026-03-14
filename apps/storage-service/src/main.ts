import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.STORAGE_SERVICE_PORT ?? '3002'),
    },
  });

  await app.listen();
  console.log(`Storage service listening on port ${process.env.CATALOG_SERVICE_PORT ?? 3002}`);
}
bootstrap();