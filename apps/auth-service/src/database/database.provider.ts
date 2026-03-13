import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../auth/entities/user.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get<string>('AUTH_POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('AUTH_POSTGRES_PORT', 5434),
        username: configService.get<string>('AUTH_POSTGRES_USER', 'postgres'),
        password: configService.get<string>('AUTH_POSTGRES_PASSWORD', 'admin'),
        database: configService.get<string>('AUTH_POSTGRES_DB', 'auth_db'),
        synchronize: configService.get<boolean>('AUTH_POSTGRES_SYNCHRONIZE', true),
        logging: configService.get<boolean>('AUTH_POSTGRES_LOGGING', false),
        entities: [User, RefreshToken],
      });

      try {
        const connection = await dataSource.initialize();
        console.log('Auth database connection established');
        return connection;
      } catch (error) {
        console.error('Auth database connection failed:', error.message);
        throw error;
      }
    },
  },
];