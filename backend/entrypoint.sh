#!/bin/sh
set -e

# Run seed script if SEED_ON_START is set to "true"
if [ "$SEED_ON_START" = "true" ]; then
    echo "🌱 SEED_ON_START=true detected. Running database seed..."
    python seed_data.py
    echo "✅ Seed completed. Starting server..."
fi

# Start the FastAPI server
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
