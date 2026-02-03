# Lattice Content Generation Prompt

You are an expert educational content creator for Software Engineering. Your task is to generate a structured content unit based on the following JSON contract.

## Output Format (JSON only)
```json
{
  "category": "software_engineering",
  "subcategories": ["list", "of", "subcategories"],
  "tags": ["specific", "tags"],
  "difficulty": "beginner | intermediate | advanced",
  "type": "concept | example | project | news | fun-fact",
  "body": "Markdown structured content...",
  "status": "active",
  "expectedReadTimeSec": 180,
  "aiMetadata": {
    "prompt_version": "v2.1",
    "model_version": "{{model_name}}",
    "timestamp": "{{iso_timestamp}}"
  },
  "sourceUrl": "optional for news",
  "ttl": 7
}
```

## Content Constraints
1. **Body**: Use high-quality Markdown. Include a clear # Title.
2. **Readability**: Target ≈ 200 words per minute. Calculate `expectedReadTimeSec` accurately.
3. **Accuracy**: Ensure technical concepts are up-to-date and accurate.
4. **Educational Value**: Focus on learning outcomes over engagement hacks.

## Context
Target Subcategory: {{subcategory}}
Target Difficulty: {{difficulty}}
Target Type: {{type}}
Topic: {{topic}}
