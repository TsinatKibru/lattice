import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RankingService, UserRankingProfile, ContentAggregateStats } from '../ranking/ranking.service';
import { Content, ContentStatus } from '../content/entities/content.entity';
import { ContentAggregates } from '../content/entities/content-aggregates.entity';

@Injectable()
export class FeedService {
    constructor(
        @InjectRepository(Content)
        private readonly contentRepository: Repository<Content>,
        @InjectRepository(ContentAggregates)
        private readonly aggregatesRepository: Repository<ContentAggregates>,
        private readonly rankingService: RankingService
    ) { }

    /**
     * Fetches and ranks content for a user from Postgres.
     */
    async getPersonalizedFeed(user: UserRankingProfile) {
        // Fetch ALL active content from the database
        const allContent = await this.contentRepository.find({
            where: { status: ContentStatus.ACTIVE }
        });

        // Fetch aggregates from database
        const aggregatesData = await this.aggregatesRepository.find();

        // Convert to Map<contentId, stats> for ranking engine
        const aggregates = new Map<string, ContentAggregateStats>();

        for (const agg of aggregatesData) {
            // Calculation: (helpful * 1.5 - challenging * 3.0) / total interactions
            // This makes feedback significantly more impactful than just viewing
            const totalInteractions = agg.helpful_count + agg.challenging_count + agg.view_count;
            const engagementScore = totalInteractions > 0
                ? (agg.helpful_count * 1.5 - agg.challenging_count * 3.0) / totalInteractions
                : 0; // Baseline for no feedback

            aggregates.set(agg.content_id, {
                engagementScore: Math.max(0, Math.min(1, engagementScore + 0.5)),
                subCategoryCounts: {},
            });
        }

        return this.rankingService.rankFeed(user, allContent, aggregates);
    }
}
