import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ContentModule } from './modules/content/content.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { FeedModule } from './modules/feed/feed.module';
import { InteractionsModule } from './modules/interactions/interactions.module';
import { BullModule } from '@nestjs/bull';
import { AiOrchestratorModule } from './modules/ai-orchestrator/ai-orchestrator.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config/dist';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true, // Only for development
      }),
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    ContentModule,
    RankingModule,
    FeedModule,
    InteractionsModule,
    AiOrchestratorModule,
    TaxonomyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
