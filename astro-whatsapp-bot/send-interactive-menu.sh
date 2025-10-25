#!/bin/bash

# Send Interactive Menu Message Script
# Usage: ./send-interactive-menu.sh

# Configuration - Using same values as before
PHONE_NUMBER_ID="883508911504885"
ACCESS_TOKEN="EAAcH41JE6tUBPxQdZCJ8P2wEqfxRin9PuwTYGzd14s0pXFY4BWZBfsvv1dZBaoNsT8xRP4uZBixqg9ia2h8eesmsnUx83xie9qMKpOtECfaJtmoyT6vZAaswqIZBJ04IKV4In2aQdCYkPZBnSPEZBZAU8l6rfPvTyWhVGtwld7BcHrbjGy0PO6sdIuoEF0MXyzZCyW5ZCYxXdcJQDOfaZBGtnYTRD8rCjVbJnmy7eGd4CuXcyzqib2oZD"
RECIPIENT_PHONE="+971544972975"

echo "Sending interactive menu message..."

# Send interactive menu with buttons
curl -X POST "https://graph.facebook.com/v18.0/$PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "messaging_product": "whatsapp",
  "to": "'"$RECIPIENT_PHONE"'",
  "type": "interactive",
  "interactive": {
    "type": "button",
    "body": {
      "text": "🌟 *What would you like to explore today?*"
    },
    "action": {
      "buttons": [
        {
          "type": "reply",
          "reply": {
            "id": "btn_daily_horoscope",
            "title": "Daily Horoscope"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "btn_birth_chart",
            "title": "Birth Chart"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "btn_compatibility",
            "title": "Compatibility"
          }
        },
        {
          "type": "reply",
          "reply": {
            "id": "btn_subscription",
            "title": "Subscription"
          }
        }
      ]
    }
  }
}'

echo ""
echo "Sent interactive menu with buttons to your phone."
echo "Check your phone ($RECIPIENT_PHONE) for the menu with clickable buttons!"