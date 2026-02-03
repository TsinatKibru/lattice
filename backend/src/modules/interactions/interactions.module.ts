import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteractionsService } from './interactions.service';
import { InteractionsController } from './interactions.controller';
import { InteractionsProcessor } from './interactions.processor';
import { ContentModule } from '../content/content.module';
import { InteractionEvent } from './entities/interaction-event.entity';
import { UserInterest } from './entities/user-interest.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'interactions',
    }),
    ContentModule,
    TypeOrmModule.forFeature([InteractionEvent, UserInterest]),
  ],
  providers: [InteractionsService, InteractionsProcessor],
  controllers: [InteractionsController],
  exports: [TypeOrmModule],
})
export class InteractionsModule { }
