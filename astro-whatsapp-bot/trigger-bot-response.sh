#!/bin/bash

# Send Message to Trigger Bot Response
# This sends a message to YOUR bot, which should make YOUR bot respond

# Configuration - Your bot's phone number and access token
PHONE_NUMBER_ID="883508911504885"
ACCESS_TOKEN="EAAcH41JE6tUBPZBZAEudlghWcbt12lcElSi5AnQERCeQFF8kP2TaZBqPdIpQ4Ew0oUqFqoxbAGriZBbaepHC9EnNnZAsJmAdArgyXyHFksglFreT4y3s7dFiSm4rps4uSVwnkAM7p4qGYeflBkiny3IzSYpETuVRIa02q5hoZCMHPzT6hAZAzk0FcYBWqzLJzJq8lTDLfZBrE9GMndSs8bzH0xyN1LvLhedSZC5ZBLqkHXKTP9BgZDZD"
RECIPIENT_PHONE="+971544972975"  # This should be your personal phone number

echo "Sending message to YOUR BOT to trigger a response..."

# Send "Menu" to YOUR bot, which should make YOUR bot respond
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
echo "Sent 'Menu' to YOUR BOT."
echo "YOUR BOT (running on Railway) should now respond to your phone ($RECIPIENT_PHONE)!"
echo ""
echo "Check your phone for a response from your bot!"