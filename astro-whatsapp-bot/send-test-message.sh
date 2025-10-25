#!/bin/bash

# Send Test Message Script for Astro WhatsApp Bot
# Usage: ./send-test-message.sh

# Configuration - Replace these with your actual values
PHONE_NUMBER_ID="883508911504885"
ACCESS_TOKEN="EAAcH41JE6tUBPZBZAEudlghWcbt12lcElSi5AnQERCeQFF8kP2TaZBqPdIpQ4Ew0oUqFqoxbAGriZBbaepHC9EnNnZAsJmAdArgyXyHFksglFreT4y3s7dFiSm4rps4uSVwnkAM7p4qGYeflBkiny3IzSYpETuVRIa02q5hoZCMHPzT6hAZAzk0FcYBWqzLJzJq8lTDLfZBrE9GMndSs8bzH0xyN1LvLhedSZC5ZBLqkHXKTP9BgZDZD"
RECIPIENT_PHONE="+971544972975"

echo "Sending test message from WhatsApp Business API..."
echo "From: +15551428384"
echo "To: $RECIPIENT_PHONE"

# Send the test message
curl -X POST "https://graph.facebook.com/v18.0/$PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "messaging_product": "whatsapp",
  "to": "'"$RECIPIENT_PHONE"'",
  "text": {
    "body": "Hello! This is a test message from your Astro Bot. 🌟 How can I help you today? Try asking for your daily horoscope or birth chart analysis!"
  }
}'

echo ""
echo "If successful, you should receive a message on your phone: $RECIPIENT_PHONE"
echo "Check your phone for the test message!"