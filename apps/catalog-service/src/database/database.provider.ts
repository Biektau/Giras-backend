import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Workwear } from 'src/workwear/workwear.entity';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get<string>('CATALOG_POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('CATALOG_POSTGRES_PORT', 5433),
        username: configService.get<string>('CATALOG_POSTGRES_USER', 'postgres'),
        password: configService.get<string>('CATALOG_POSTGRES_PASSWORD', 'admin'),
        database: configService.get<string>('CATALOG_POSTGRES_DB', 'catalog_db'),
        synchronize: configService.get<boolean>('CATALOG_POSTGRES_SYNCHRONIZE', true),
        logging: configService.get<boolean>('CATALOG_POSTGRES_LOGGING', false),
        entities: [Workwear],
      });

      try {
        const connection = await dataSource.initialize();
        console.log('Catalog database connection established');
        return connection;
      } catch (error) {
        console.error('Catalog database connection failed:', error.message);
        throw error;
      }
    },
  },
];