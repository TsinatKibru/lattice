import { Module } from '@nestjs/common';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { ContentModule } from '../content/content.module';
import { InteractionsModule } from '../interactions/interactions.module';
import { AiOrchestratorController } from './ai-orchestrator.controller';

@Module({
  imports: [TaxonomyModule, ContentModule, InteractionsModule],
  providers: [AiOrchestratorService],
  controllers: [AiOrchestratorController],
})
export class AiOrchestratorModule { }
