#!/bin/bash

# Send Menu Trigger Message Script
# Usage: ./send-menu-trigger.sh

# Configuration - Using same values as before
PHONE_NUMBER_ID="883508911504885"
ACCESS_TOKEN="EAAcH41JE6tUBPZBZAEudlghWcbt12lcElSi5AnQERCeQFF8kP2TaZBqPdIpQ4Ew0oUqFqoxbAGriZBbaepHC9EnNnZAsJmAdArgyXyHFksglFreT4y3s7dFiSm4rps4uSVwnkAM7p4qGYeflBkiny3IzSYpETuVRIa02q5hoZCMHPzT6hAZAzk0FcYBWqzLJzJq8lTDLfZBrE9GMndSs8bzH0xyN1LvLhedSZC5ZBLqkHXKTP9BgZDZD"
RECIPIENT_PHONE="+971544972975"

echo "Sending menu trigger message..."

# Send "Menu" command to trigger the main menu
curl -X POST "https://graph.facebook.com/v18.0/$PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "messaging_product": "whatsapp",
  "to": "'"$RECIPIENT_PHONE"'",
  "text": {
    "body": "Menu"
  }
}'

echo ""
echo "Sent 'Menu' command to trigger the main menu options."
echo "Check your phone ($RECIPIENT_PHONE) for the response!"