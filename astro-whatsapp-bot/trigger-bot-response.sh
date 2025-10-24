#!/bin/bash

# Send Message to Trigger Bot Response
# This sends a message to YOUR bot, which should make YOUR bot respond

# Configuration - Your bot's phone number and access token
PHONE_NUMBER_ID="883508911504885"
ACCESS_TOKEN="EAAcH41JE6tUBP0KsKn9CyaqbOQj28fJpG9AOUjwb0TWSCiUMGR21gnUR4iqhicBXj6ZCSnpJb3oTBpH0zz1Yfxqvup755XfZCBnILOZCZA67ElejlzwD6LDDtgjafECa3ZBlfy9mkZAAZA1qLyPjWZAkocBSUqBI3ak2csYVT4M05ZBcTnlRpKMRcd6NZCFL9fLQSRXqvxYurX6BiRctdcoAKLnCrqxIcmJ3AbSLORhd0ZALza9LagZD"
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