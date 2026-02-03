# How to Generate More Content

## Current Status
Your database has **1 active content item**. That's why the feed only shows one card.

## Generate More Content (Backend)

### Option 1: Via API (Recommended)
```bash
# Generate 5 new articles about software engineering
curl -X POST http://localhost:3000/ai-orchestrator/generate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "category": "software_engineering",
    "difficulty": "intermediate",
    "count": 5
  }'
```

### Option 2: Via NestJS CLI
```bash
cd /home/calm/nestJs/lattice

# Start the backend if not running
npm run start:dev

# In another terminal, trigger generation
curl -X POST http://localhost:3000/ai-orchestrator/generate-batch \
  -H "Content-Type: application/json" \
  -d '{"category": "software_engineering", "difficulty": "beginner", "count": 3}'
```

## Verify Content Was Created

```bash
# Check database
docker exec lattice-db psql -U lattice -d lattice -c "SELECT id, category, difficulty, LEFT(body, 50) FROM content WHERE status = 'ACTIVE';"
```

## Refresh Flutter App

After generating content:
1. Tap the **refresh icon** (↻) in the app
2. You should now see multiple cards in the feed

## Available Categories
- `software_engineering`
- `data_science`
- `machine_learning`
- `web_development`
- `databases`

## Available Difficulties
- `beginner`
- `intermediate`
- `advanced`

## Troubleshooting

### Generation fails
- Check backend logs: `npm run start:dev`
- Ensure Gemini API key is set in `.env`
- Verify Docker containers are running: `docker compose ps`

### Content not appearing in feed
- Check status is `ACTIVE`: `SELECT status FROM content;`
- Verify backend is running on port 3000
- Check Flutter app backend URL in `lib/core/constants.dart`
