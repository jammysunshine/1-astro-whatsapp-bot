#!/bin/bash

# Send Help Message to Trigger Bot Menu
# This sends a "Help" command that should trigger the menu

PHONE_NUMBER_ID="883508911504885"
ACCESS_TOKEN="EAAcH41JE6tUBP0KsKn9CyaqbOQj28fJpG9AOUjwb0TWSCiUMGR21gnUR4iqhicBXj6ZCSnpJb3oTBpH0zz1Yfxqvup755XfZCBnILOZCZA67ElejlzwD6LDDtgjafECa3ZBlfy9mkZAAZA1qLyPjWZAkocBSUqBI3ak2csYVT4M05ZBcTnlRpKMRcd6NZCFL9fLQSRXqvxYurX6BiRctdcoAKLnCrqxIcmJ3AbSLORhd0ZALza9LagZD"
RECIPIENT_PHONE="+971544972975"

echo "Sending 'Help' message to YOUR BOT to trigger menu..."

# Send "Help" to your bot
curl -X POST "https://graph.facebook.com/v18.0/$PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
  "messaging_product": "whatsapp",
  "to": "'"$RECIPIENT_PHONE"'",
  "text": {
    "body": "Help"
  }
}'

echo ""
echo "Sent 'Help' to YOUR BOT."
echo "YOUR BOT should now respond with the menu!"
echo "Check your phone ($RECIPIENT_PHONE) for the response!"