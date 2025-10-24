#!/bin/bash

# Send Hi Message to Trigger Bot Response
# This sends a simple "Hi" to your bot to trigger the welcome response

PHONE_NUMBER_ID="883508911504885"
ACCESS_TOKEN="EAAcH41JE6tUBP0KsKn9CyaqbOQj28fJpG9AOUjwb0TWSCiUMGR21gnUR4iqhicBXj6ZCSnpJb3oTBpH0zz1Yfxqvup755XfZCBnILOZCZA67ElejlzwD6LDDtgjafECa3ZBlfy9mkZAAZA1qLyPjWZAkocBSUqBI3ak2csYVT4M05ZBcTnlRpKMRcd6NZCFL9fLQSRXqvxYurX6BiRctdcoAKLnCrqxIcmJ3AbSLORhd0ZALza9LagZD"
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