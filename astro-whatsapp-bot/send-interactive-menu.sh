#!/bin/bash

# Send Interactive Menu Message Script
# Usage: ./send-interactive-menu.sh

# Configuration - Using same values as before
PHONE_NUMBER_ID="883508911504885"
ACCESS_TOKEN="EAAcH41JE6tUBPZBZAEudlghWcbt12lcElSi5AnQERCeQFF8kP2TaZBqPdIpQ4Ew0oUqFqoxbAGriZBbaepHC9EnNnZAsJmAdArgyXyHFksglFreT4y3s7dFiSm4rps4uSVwnkAM7p4qGYeflBkiny3IzSYpETuVRIa02q5hoZCMHPzT6hAZAzk0FcYBWqzLJzJq8lTDLfZBrE9GMndSs8bzH0xyN1LvLhedSZC5ZBLqkHXKTP9BgZDZD"
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