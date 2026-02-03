import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InteractionEvent as InteractionEventInterface, InteractionType } from './interactions.service';
import { ContentAggregates } from '../content/entities/content-aggregates.entity';
import { InteractionEvent } from './entities/interaction-event.entity';
import { UserInterest } from './entities/user-interest.entity';
import { Content } from '../content/entities/content.entity';

@Processor('interactions')
export class InteractionsProcessor {
    constructor(
        @InjectRepository(ContentAggregates)
        private readonly aggregatesRepository: Repository<ContentAggregates>,
        @InjectRepository(InteractionEvent)
        private readonly eventsRepository: Repository<InteractionEvent>,
        @InjectRepository(UserInterest)
        private readonly interestRepository: Repository<UserInterest>,
        @InjectRepository(Content)
        private readonly contentRepository: Repository<Content>,
    ) { }

    /**
     * Processes interaction events: persists to DB, updates aggregates, and updates user interests.
     */
    @Process('aggregate')
    async handleAggregation(job: Job<InteractionEventInterface>) {
        const event = job.data;

        console.log(`[Processor] Processing ${event.type} for content ${event.contentId}`);

        // 1. Persist the event to interaction_events table
        await this.eventsRepository.save({
            user_id: event.userId,
            content_id: event.contentId,
            type: event.type,
            metadata: event.metadata,
        });

        // 2. Update Content Aggregates
        const columnMap: Record<string, string> = {
            [InteractionType.VIEWED]: 'view_count',
            [InteractionType.SAVED]: 'save_count',
            [InteractionType.HELPFUL]: 'helpful_count',
            [InteractionType.CHALLENGING]: 'challenging_count',
        };

        const column = columnMap[event.type];
        if (column) {
            await this.aggregatesRepository.query(`
                INSERT INTO content_aggregates (content_id, ${column}, last_interaction_at)
                VALUES ($1, 1, NOW())
                ON CONFLICT (content_id) 
                DO UPDATE SET 
                    ${column} = content_aggregates.${column} + 1,
                    last_interaction_at = NOW(),
                    updated_at = NOW()
            `, [event.contentId]);
        }

        // 3. Update User Interests (The "Demand Signal")
        await this.updateUserInterests(event);

        console.log(`[Processor] Completed processing for content ${event.contentId}`);
    }

    private async updateUserInterests(event: InteractionEventInterface) {
        const content = await this.contentRepository.findOne({ where: { id: event.contentId } });
        if (!content || !content.subcategories) return;

        // Weight mapping for demand signals
        const weightMap: Record<string, number> = {
            [InteractionType.VIEWED]: 0.1,
            [InteractionType.SAVED]: 0.5,
            [InteractionType.HELPFUL]: 1.0,
            [InteractionType.CHALLENGING]: 2.0, // High weight to trigger foundational content
        };

        const delta = weightMap[event.type] || 0;
        if (delta === 0) return;

        for (const sub of content.subcategories) {
            await this.interestRepository.query(`
                INSERT INTO user_interests (user_id, subcategory, weight, last_updated)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (user_id, subcategory)
                DO UPDATE SET 
                    weight = user_interests.weight + $3,
                    last_updated = NOW()
            `, [event.userId, sub, delta]);
        }

        console.log(`[Processor] Updated interest weights for user ${event.userId} on subcategories: ${content.subcategories.join(', ')}`);
    }
}
