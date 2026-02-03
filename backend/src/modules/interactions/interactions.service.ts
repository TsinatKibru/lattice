import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export enum InteractionType {
    VIEWED = 'viewed',
    SKIPPED = 'skipped',
    SAVED = 'saved',
    RATED = 'rated',
    HELPFUL = 'helpful',
    CHALLENGING = 'challenging',
}

export interface InteractionEvent {
    userId: string;
    contentId: string;
    type: InteractionType;
    metadata?: any;
    timestamp: Date;
}

@Injectable()
export class InteractionsService {
    constructor(@InjectQueue('interactions') private interactionsQueue: Queue) { }

    /**
     * Ingests a raw interaction event and queues it for async processing.
     * This ensures the request path remains fast and append-only.
     */
    async logInteraction(event: Omit<InteractionEvent, 'timestamp'>) {
        const fullEvent: InteractionEvent = {
            ...event,
            timestamp: new Date(),
        };

        // Store raw event (Append-only signal)
        console.log(`[Interactions] Logging event: ${fullEvent.type} for content ${fullEvent.contentId}`);

        // Queue for aggregation
        console.log(`[Interactions] Adding job to queue 'interactions': aggregate`);
        const job = await this.interactionsQueue.add('aggregate', fullEvent, {
            removeOnComplete: true,
        });
        console.log(`[Interactions] Job added with ID: ${job.id}`);

        return { status: 'queued', jobId: job.id };
    }
}
