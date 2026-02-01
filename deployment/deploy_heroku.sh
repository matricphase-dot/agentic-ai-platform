# D:\AGENTIC_AI\deployment\deploy_heroku.sh
#!/bin/bash

echo "🚀 Deploying Agentic AI to Heroku..."

# Install Heroku CLI if not installed
if ! command -v heroku &> /dev/null; then
    echo "Installing Heroku CLI..."
    curl https://cli-assets.heroku.com/install.sh | sh
fi

# Login to Heroku
heroku login

# Create app
heroku create agentic-ai-$(date +%s)
APP_NAME=$(heroku apps:info --json | jq -r '.app.name')

echo "Created app: $APP_NAME"

# Set environment variables
heroku config:set SECRET_KEY=$(openssl rand -hex 32)
heroku config:set ENVIRONMENT=production
heroku config:set WEB_CONCURRENCY=4

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# Deploy
git init
git add .
git commit -m "Initial deployment of Agentic AI Platform"
git push heroku main

# Open app
heroku open

echo "✅ Deployment complete!"
echo "🌐 App URL: https://$APP_NAME.herokuapp.com"
echo "📊 Dashboard: https://$APP_NAME.herokuapp.com/dashboard"
echo "📚 API Docs: https://$APP_NAME.herokuapp.com/docs"