import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { RankingModule } from '../ranking/ranking.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [RankingModule, ContentModule],
  providers: [FeedService],
  controllers: [FeedController]
})
export class FeedModule { }
