#!/bin/bash

# Send Hi Message to Trigger Bot Response
# This sends a simple "Hi" to your bot to trigger the welcome response

PHONE_NUMBER_ID="883508911504885"
ACCESS_TOKEN="EAAcH41JE6tUBPZBZAEudlghWcbt12lcElSi5AnQERCeQFF8kP2TaZBqPdIpQ4Ew0oUqFqoxbAGriZBbaepHC9EnNnZAsJmAdArgyXyHFksglFreT4y3s7dFiSm4rps4uSVwnkAM7p4qGYeflBkiny3IzSYpETuVRIa02q5hoZCMHPzT6hAZAzk0FcYBWqzLJzJq8lTDLfZBrE9GMndSs8bzH0xyN1LvLhedSZC5ZBLqkHXKTP9BgZDZD"
RECIPIENT_PHONE="+971544972975"

echo "Sending 'Hi' message to YOUR BOT to trigger welcome response..."

# Send "Hi" to your bot
curl -X POST "https://graph.facebook.com/v18.0/$PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "messaging_product": "whatsapp",
  "to": "'"$RECIPIENT_PHONE"'",
  "text": {
    "body": "Hi"
  }
}'

echo ""
echo "Sent 'Hi' to YOUR BOT."
echo "YOUR BOT should now respond with a welcome message and menu!"
echo "Check your phone ($RECIPIENT_PHONE) for the response!"