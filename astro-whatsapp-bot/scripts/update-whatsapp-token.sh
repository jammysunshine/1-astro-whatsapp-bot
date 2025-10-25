#!/bin/bash

# Quick WhatsApp Token Update Script
# Usage: ./scripts/update-whatsapp-token.sh YOUR_NEW_TOKEN

set -e

NEW_TOKEN="$1"

if [ -z "$NEW_TOKEN" ]; then
    echo "❌ Error: Please provide the new WhatsApp access token"
    echo "Usage: $0 YOUR_NEW_TOKEN_HERE"
    exit 1
fi

echo "🔄 Updating WhatsApp access token in Railway..."

# Update the token
railway variables --set "W1_WHATSAPP_ACCESS_TOKEN=$NEW_TOKEN"

echo "✅ Token updated successfully!"
echo "🚀 Railway will automatically redeploy with the new token."
echo ""
echo "To verify the update worked:"
echo "  railway logs --follow"
echo ""
echo "Or check token validity:"
echo "  npm run check-token"