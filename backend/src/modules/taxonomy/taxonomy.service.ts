import { Injectable, Logger } from '@nestjs/common';
import { Content } from '../content/entities/content.entity';

@Injectable()
export class TaxonomyService {
    private readonly logger = new Logger(TaxonomyService.name);

    // Master List for v2.1 Canonical Version
    private readonly TAXONOMY = {
        categories: ['software_engineering'],
        subcategories: {
            software_engineering: [
                'backend',
                'frontend',
                'databases',
                'devops',
                'distributed_systems',
                'mobile',
                'ai_engineering',
            ],
        },
        validTags: [
            'nestjs', 'nodejs', 'typescript', 'react', 'flutter', 'dart',
            'postgres', 'redis', 'docker', 'kubernetes', 'aws', 'gcp',
            'system_design', 'microservices', 'graphql', 'rest_api'
        ]
    };

    findCategoryBySubcategory(subcategory: string): string | null {
        for (const [category, subcats] of Object.entries(this.TAXONOMY.subcategories)) {
            if ((subcats as string[]).includes(subcategory)) {
                return category;
            }
        }
        return this.TAXONOMY.categories.includes(subcategory) ? subcategory : null;
    }

    /**
     * Validates and filters AI-generated content metadata.
     * - Strips invalid subcategories and tags.
     * - Fallback: If no valid subcategories remain, defaults to empty list (or could assign a generic one).
     * - Logs fallbacks for QA.
     */
    validateAndClean(content: Partial<Content>): Partial<Content> {
        const originalSubcats = content.subcategories || [];
        const originalTags = content.tags || [];

        // 1. Validate Category
        if (!content.category || !this.TAXONOMY.categories.includes(content.category)) {
            this.logger.warn(`[TaxonomyGuard] Rejecting invalid category: ${content.category}`);
            throw new Error(`Invalid category: ${content.category}`);
        }

        // 2. Filter Subcategories
        const allowedSubcats = this.TAXONOMY.subcategories[content.category] || [];
        const validSubcategories = originalSubcats.filter(sub =>
            allowedSubcats.includes(sub)
        );

        // 3. Filter Tags
        const validTags = originalTags.filter(tag =>
            this.TAXONOMY.validTags.includes(tag)
        );

        // 4. Log Fallback occurrences
        if (validSubcategories.length !== originalSubcats.length) {
            this.logger.warn(`[TaxonomyGuard] Filtered invalid subcategories for ${content.id || 'new-content'}: ${originalSubcats.filter(s => !validSubcategories.includes(s)).join(', ')
                }`);
        }

        if (validTags.length !== originalTags.length) {
            this.logger.warn(`[TaxonomyGuard] Filtered invalid tags for ${content.id || 'new-content'}: ${originalTags.filter(t => !validTags.includes(t)).join(', ')
                }`);
        }

        // 5. Fallback Logic (if everything was filtered, keep it empty or default)
        // The ranking engine handles empty subcats gracefully (fallback weight)

        return {
            ...content,
            subcategories: validSubcategories,
            tags: validTags,
        };
    }
}
