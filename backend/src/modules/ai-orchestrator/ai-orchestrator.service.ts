import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaxonomyService } from '../taxonomy/taxonomy.service';
import { Content, ContentDifficulty, ContentStatus } from '../content/entities/content.entity';
import { UserInterest } from '../interactions/entities/user-interest.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AiOrchestratorService {
    private readonly logger = new Logger(AiOrchestratorService.name);
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(
        @InjectRepository(Content)
        private readonly contentRepository: Repository<Content>,
        @InjectRepository(UserInterest)
        private readonly interestRepository: Repository<UserInterest>,
        private readonly taxonomyService: TaxonomyService,
        private readonly configService: ConfigService,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        } else {
            this.logger.warn('GEMINI_API_KEY not found. AI generation will fail.');
        }
    }

    /**
     * Scheduled task to generate content based on user demand signals.
     * Runs every 15 minutes for testing.
     */
    @Cron('*/15 * * * *')
    async handleScheduledTargetedGeneration() {
        this.logger.log('[Scheduler] Starting targeted content generation block...');

        // 1. Fetch top demand signal (demo user 1)
        const topInterest = await this.interestRepository.findOne({
            where: { user_id: 'demo_user_1' },
            order: { weight: 'DESC' }
        });

        if (!topInterest) {
            this.logger.log('[Scheduler] No demand signals found. Generating default intro content.');
            return this.generateContentBatch({
                category: 'software_engineering',
                subcategory: 'backend',
                count: 1,
                difficulty: 'beginner'
            });
        }

        this.logger.log(`[Scheduler] Top demand signal detected: ${topInterest.subcategory} (weight: ${topInterest.weight.toFixed(1)})`);

        // 2. Resolve parent category
        const parentCategory = this.taxonomyService.findCategoryBySubcategory(topInterest.subcategory) || 'software_engineering';
        let targetDifficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
        if (topInterest.weight > 10) targetDifficulty = 'advanced';
        else if (topInterest.weight > 5) targetDifficulty = 'intermediate';

        // 3. Trigger generation for the detected interest
        return this.generateContentBatch({
            category: parentCategory,
            subcategory: topInterest.subcategory,
            count: 1,
            difficulty: targetDifficulty
        });
    }

    /**
     * Orchestrates a batch content generation job.
     */
    async generateContentBatch(options: {
        category: string;
        subcategory?: string;
        count: number;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
    }) {
        // Auto-fix if category is actually a subcategory
        let category = options.category;
        let subcategory = options.subcategory || options.category;

        const resolvedCategory = this.taxonomyService.findCategoryBySubcategory(category);
        if (resolvedCategory && resolvedCategory !== category) {
            category = resolvedCategory;
        }

        this.logger.log(`Starting generation for ${category}/${subcategory} (${options.difficulty}) - count: ${options.count}`);

        const results: any[] = [];
        const promptPath = path.join(process.cwd(), 'src/modules/content/prompts/content.prompt.md');
        let promptTemplate: string;

        try {
            promptTemplate = fs.readFileSync(promptPath, 'utf-8');
        } catch (e) {
            this.logger.error(`Failed to read prompt template: ${e.message}`);
            return [];
        }

        for (let i = 0; i < options.count; i++) {
            try {
                const topic = `A key architectural concept in ${subcategory} for a ${options.difficulty} level engineer`;
                this.logger.log(`Generating unit ${i + 1}/${options.count}: ${topic}`);

                let generatedContent: any;
                try {
                    generatedContent = await this.generateSingleUnit(promptTemplate, {
                        category: category,
                        subcategory: subcategory,
                        difficulty: options.difficulty,
                        type: 'concept',
                        topic: topic,
                        model_name: 'gemini-2.0-flash',
                        iso_timestamp: new Date().toISOString()
                    });
                } catch (apiError) {
                    if (apiError.message.includes('429')) {
                        this.logger.warn('⚠️ Quota Exceeded (429). Activating Smart Mock Fallback...');
                        generatedContent = this.generateMockUnit(category, subcategory, options.difficulty, topic);
                    } else {
                        throw apiError;
                    }
                }

                const cleanContent = {
                    ...generatedContent,
                    category: category,
                    difficulty: options.difficulty as ContentDifficulty,
                    status: ContentStatus.ACTIVE
                };

                const validatedContent = this.taxonomyService.validateAndClean(cleanContent) as any;
                const savedContent = await this.contentRepository.save(validatedContent);
                results.push(savedContent);

                this.logger.log(`Generated and SAVED unit: ${savedContent.id} (${savedContent.category})`);

            } catch (error) {
                this.logger.error(`Failed to generate/validate unit: ${error.message}`);
            }
        }

        return results;
    }

    private generateMockUnit(category: string, subcategory: string, difficulty: string, topic: string) {
        return {
            category: category,
            subcategories: [subcategory, 'mock-layer'],
            tags: [subcategory, 'refinement'],
            difficulty: difficulty,
            type: 'concept',
            body: `# ${topic}\n\nThis is a high-fidelity mock unit generated because your Gemini quota has been reached. \n\n### Core Principle\nIn ${subcategory}, maintaining balance and structure is key. When working at an ${difficulty} level, one must consider scaling, reliability, and the underlying performance of the system.\n\n### Key Takeaway\nLattice will automatically resume real AI generation as soon as your daily quota resets. For now, enjoy testing the Celestial UI!`,
            status: 'active',
            expectedReadTimeSec: 180,
            aiMetadata: {
                prompt_version: 'v2.1',
                model_version: 'mock-fallback',
                timestamp: new Date().toISOString()
            }
        };
    }

    private async generateSingleUnit(template: string, variables: any) {
        if (!this.model) throw new Error('AI Model not initialized');
        let prompt = template;
        for (const [key, value] of Object.entries(variables)) {
            prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return this.parseJsonFromMarkdown(response.text());
    }

    private parseJsonFromMarkdown(text: string): any {
        try {
            // 1. Try to find content between ```json and ```
            let jsonString = '';
            const blockRegex = /```json([\s\S]*?)(?:```|$)/;
            const match = text.match(blockRegex);

            if (match && match[1]) {
                jsonString = match[1].trim();
            } else {
                // 2. Fallback: find first { and last }
                const start = text.indexOf('{');
                const end = text.lastIndexOf('}');
                if (start !== -1 && end !== -1 && end > start) {
                    jsonString = text.substring(start, end + 1);
                } else {
                    jsonString = text.trim();
                }
            }

            return JSON.parse(jsonString);
        } catch (e) {
            this.logger.error(`JSON Parse Error. Length: ${text.length}. Snippet: ${text.substring(0, 150).replace(/\n/g, ' ')}...`);
            throw new Error(`Failed to parse JSON from AI response: ${e.message}`);
        }
    }
}
