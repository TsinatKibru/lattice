import { Test, TestingModule } from '@nestjs/testing';
import { RankingService, UserRankingProfile, ContentAggregateStats } from './ranking.service';
import { Content, ContentStatus, ContentType, ContentDifficulty } from '../content/entities/content.entity';

describe('RankingService', () => {
    let service: RankingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RankingService],
        }).compile();

        service = module.get<RankingService>(RankingService);
    });

    const mockUser: UserRankingProfile = {
        id: 'user-1',
        interestWeights: { backend: 0.8, database: 0.6 },
        difficultyLevel: 0.6, // Intermediate
    };

    const mockContent: Content[] = [
        {
            id: 'c1',
            category: 'SE',
            subcategories: ['backend'],
            tags: ['nest'],
            difficulty: ContentDifficulty.INTERMEDIATE,
            type: ContentType.CONCEPT,
            body: '...',
            status: ContentStatus.ACTIVE,
            expectedReadTimeSec: 120,
            aiMetadata: { prompt_version: '1', model_version: '1', timestamp: '' },
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'c2',
            category: 'SE',
            subcategories: ['frontend'],
            tags: ['react'],
            difficulty: ContentDifficulty.BEGINNER,
            type: ContentType.CONCEPT,
            body: '...',
            status: ContentStatus.ACTIVE,
            expectedReadTimeSec: 60,
            aiMetadata: { prompt_version: '1', model_version: '1', timestamp: '' },
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    const mockAggregates = new Map<string, ContentAggregateStats>([
        ['c1', { engagementScore: 0.8, subCategoryCounts: {} }],
        ['c2', { engagementScore: 0.4, subCategoryCounts: {} }],
    ]);

    it('should be deterministic (Ranking Stability Test)', () => {
        const result1 = service.rankFeed(mockUser, [...mockContent], mockAggregates);
        const result2 = service.rankFeed(mockUser, [...mockContent], mockAggregates);

        expect(result1).toEqual(result2);
        expect(result1[0].id).toBe(result2[0].id);
        expect(result1[0].score).toBe(result2[0].score);
    });

    it('should promote content that matches user interests', () => {
        const ranked = service.rankFeed(mockUser, mockContent, mockAggregates);
        // c1 is backend (0.8), c2 is frontend (0.0)
        // Even if recency is same, c1 should rank higher due to interest + engagement
        expect(ranked[0].id).toBe('c1');
    });

    it('should apply recency decay', () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 30); // 30 days ago

        const oldContent: Content = {
            ...mockContent[0],
            id: 'old-1',
            createdAt: oldDate,
        };

        const newContent: Content = {
            ...mockContent[0],
            id: 'new-1',
            createdAt: new Date(),
        };

        const aggregates = new Map<string, ContentAggregateStats>([
            ['old-1', { engagementScore: 0.8, subCategoryCounts: {} }],
            ['new-1', { engagementScore: 0.8, subCategoryCounts: {} }],
        ]);

        const ranked = service.rankFeed(mockUser, [oldContent, newContent], aggregates);

        expect(ranked[0].id).toBe('new-1');
    });

    it('should clamp scores between 0 and 1', () => {
        const ranked = service.rankFeed(mockUser, mockContent, mockAggregates);
        ranked.forEach(item => {
            expect(item.score).toBeGreaterThanOrEqual(0);
            expect(item.score).toBeLessThanOrEqual(1);
        });
    });
});
