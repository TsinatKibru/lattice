import { Injectable } from '@nestjs/common';
import { Content } from '../content/entities/content.entity';

export interface UserRankingProfile {
    id: string;
    interestWeights: Record<string, number>; // e.g., { 'backend': 0.8, 'frontend': 0.2 }
    difficultyLevel: number; // [0, 1] normalized
}

export interface ContentAggregateStats {
    engagementScore: number; // Pre-aggregated [0, 1]
    subCategoryCounts: Record<string, number>; // For diversity penalty (recent window)
}

@Injectable()
export class RankingService {
    /**
     * Weights for the deterministic ranking formula.
     * Locked in for v2.1 canonical version.
     */
    private readonly WEIGHTS = {
        INTEREST: 0.20,      // matches user preference
        ENGAGEMENT: 0.50,    // pre-aggregated interaction signals (Boosted!)
        RECENCY: 0.15,       // promotes fresh content
        DIFFICULTY: 0.10,    // aligns with inferred user level
        DIVERSITY: -0.05,    // reduces repeated subcategory dominance
    };

    /**
     * Ranks a list of content items for a specific user.
     * This is a pure function: same input always yields same output.
     */
    rankFeed(
        user: UserRankingProfile,
        contentItems: Content[],
        aggregates: Map<string, ContentAggregateStats>,
        windowSize: number = 10,
    ): (Content & { score: number })[] {
        const scoredItems = contentItems.map((item) => {
            const stats = aggregates.get(item.id) || {
                engagementScore: 0.5, // Cold start default
                subCategoryCounts: {},
            };

            const score = this.calculateItemScore(user, item, stats, windowSize);

            return {
                ...item,
                score: this.clamp(score, 0, 1),
            };
        });

        // Sort by score descending
        return scoredItems.sort((a, b) => b.score - a.score);
    }

    private calculateItemScore(
        user: UserRankingProfile,
        item: Content,
        stats: ContentAggregateStats,
        windowSize: number,
    ): number {
        // 1. Interest Weight (normalized [0, 1])
        const interestWeight = this.calculateInterestWeight(user, item);

        // 2. Engagement Score (pre-aggregated [0, 1])
        const engagementScore = stats.engagementScore;

        // 3. Recency Decay (exponential decay based on days)
        const recencyDecay = this.calculateRecencyDecay(item.createdAt);

        // 4. Difficulty Match (bonus if aligned with user level)
        const difficultyMatch = this.calculateDifficultyMatch(user, item);

        // 5. Diversity Penalty (applied based on subcategory saturation in recent window)
        const diversityPenalty = this.calculateDiversityPenalty(item, stats, windowSize);

        return (
            this.WEIGHTS.INTEREST * interestWeight +
            this.WEIGHTS.ENGAGEMENT * engagementScore +
            this.WEIGHTS.RECENCY * recencyDecay +
            this.WEIGHTS.DIFFICULTY * difficultyMatch +
            this.WEIGHTS.DIVERSITY * diversityPenalty
        );
    }

    private calculateInterestWeight(user: UserRankingProfile, item: Content): number {
        if (!item.subcategories || item.subcategories.length === 0) return 0.5;

        // Average weight of all subcategories present in the content
        const weights = item.subcategories.map(sub => user.interestWeights[sub] || 0);
        return weights.reduce((a, b) => a + b, 0) / weights.length;
    }

    private calculateRecencyDecay(createdAt: Date): number {
        const now = new Date();
        const ageInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        // Exponential decay: e^(-days / 14) -> half-life of ~9.7 days
        return Math.exp(-ageInDays / 14);
    }

    private calculateDifficultyMatch(user: UserRankingProfile, item: Content): number {
        const difficultyMap = { beginner: 0.2, intermediate: 0.6, advanced: 1.0 };
        const itemLevel = difficultyMap[item.difficulty] || 0.5;
        // Difference penalty: 1 - abs(userLevel - itemLevel)
        return 1 - Math.abs(user.difficultyLevel - itemLevel);
    }

    private calculateDiversityPenalty(
        item: Content,
        stats: ContentAggregateStats,
        windowSize: number,
    ): number {
        // If more than 2 items from the same subcategory appear in current window
        let maxSaturation = 0;
        item.subcategories.forEach(sub => {
            const count = stats.subCategoryCounts[sub] || 0;
            const saturation = Math.max(0, count - 2) / windowSize;
            if (saturation > maxSaturation) maxSaturation = saturation;
        });
        return maxSaturation;
    }

    private clamp(val: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, val));
    }
}
