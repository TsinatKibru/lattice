import { Controller, Get, Query } from '@nestjs/common';
import { FeedService } from './feed.service';
import { UserRankingProfile } from '../ranking/ranking.service';

@Controller('feed')
export class FeedController {
    constructor(private readonly feedService: FeedService) { }

    @Get()
    async getFeed(
        @Query('userId') userId: string = 'guest',
        @Query('targetDifficulty') difficulty: string = '0.5',
        @Query('interests') interests: string = 'software_engineering',
    ) {
        // Parse interests string e.g., "backend:0.8,database:0.6" OR "backend,databases"
        const interestWeights: Record<string, number> = {};
        interests.split(',').forEach((pair) => {
            const [key, val] = pair.split(':');
            if (key) {
                interestWeights[key.trim()] = val ? parseFloat(val) : 1.0;
            }
        });

        const userProfile: UserRankingProfile = {
            id: userId,
            interestWeights,
            difficultyLevel: parseFloat(difficulty),
        };

        return this.feedService.getPersonalizedFeed(userProfile);
    }
}
