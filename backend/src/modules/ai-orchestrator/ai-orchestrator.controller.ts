import { Controller, Post, Body } from '@nestjs/common';
import { AiOrchestratorService } from './ai-orchestrator.service';

@Controller('ai-orchestrator')
export class AiOrchestratorController {
    constructor(private readonly aiOrchestratorService: AiOrchestratorService) { }

    @Post('generate-batch')
    async generateBatch(
        @Body('category') category: string,
        @Body('count') count: number = 1,
        @Body('difficulty') difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
    ) {
        return this.aiOrchestratorService.generateContentBatch({
            category,
            count,
            difficulty,
        });
    }

    @Post('trigger-targeted')
    async triggerTargeted() {
        return this.aiOrchestratorService.handleScheduledTargetedGeneration();
    }
}
