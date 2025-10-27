#!/bin/bash

# Set Render environment variables using API

SERVICE_ID="srv-d3v22avdiees73elebfg"
RENDER_API_KEY="rnd_Z4z9UHwt84mnopW590eykCN6Lfx7"

echo "Setting environment variables on Render service $SERVICE_ID..."

# Function to set env var
set_env_var() {
    local key=$1
    local value=$2
    echo "Setting $key..."
    curl -s -X POST -H "Authorization: Bearer $RENDER_API_KEY" -H "Content-Type: application/json" -d "{\"key\":\"$key\",\"value\":\"$value\"}" https://api.render.com/v1/services/$SERVICE_ID/env-vars > /dev/null
}

# Database
set_env_var DB_USER jammysunshine
set_env_var DB_PASSWORD 11wMGp1fnrwhZGIQ
set_env_var DB_HOST cluster0.qqweu91.mongodb.net
set_env_var DB_NAME astro-whatsapp-bot

# WhatsApp
set_env_var W1_WHATSAPP_ACCESS_TOKEN EAAcH41JE6tUBP09oXFcomZBx28tZARXOAxZAjlu1gHa0rRWnjOPfFZBKaBOVUuuLxj409EX8XJOExXYHy7cCsCnnb62vZBFnahyBhdI6IxhX1rgR2P5eEi7ZAwZAnKTXMJggVO7ZA4J48S8YnDdJw8rkwZCiBKKoFKhGvXnwZDZD
set_env_var W1_WHATSAPP_PHONE_NUMBER_ID 883508911504885
set_env_var W1_WHATSAPP_VERIFY_TOKEN SecureVerify2025_883508911504885
set_env_var W1_WHATSAPP_APP_SECRET dcc77411af935dc0eb54636ce9594313

# Features
set_env_var FEATURE_AI_TWIN_ENABLED true
set_env_var FEATURE_TRANSIT_TIMING_ENABLED true
set_env_var FEATURE_COMPATIBILITY_CHECKING_ENABLED true
set_env_var FEATURE_SOCIAL_NETWORKING_ENABLED true

# Defaults
set_env_var DEFAULT_CURRENCY USD
set_env_var DEFAULT_LANGUAGE en
set_env_var DEFAULT_TIMEZONE UTC

# Performance
set_env_var MAX_CONCURRENT_REQUESTS 10
set_env_var REQUEST_TIMEOUT_MS 30000
set_env_var LOG_LEVEL info

# AI Services
set_env_var MISTRAL_API_KEY 3edVHVEFtjzmQKeC4BgBWjLYoIij4Izw

echo "Environment variables set successfully. The service will redeploy automatically."