import { Controller, Post, Body } from '@nestjs/common';
import { InteractionsService, InteractionType } from './interactions.service';

@Controller('interactions')
export class InteractionsController {
    constructor(private readonly interactionsService: InteractionsService) { }

    @Post('track')
    async trackEvent(
        @Body('userId') userId: string,
        @Body('contentId') contentId: string,
        @Body('type') type: InteractionType,
        @Body('metadata') metadata?: any,
    ) {
        return this.interactionsService.logInteraction({
            userId,
            contentId,
            type,
            metadata,
        });
    }
}
