#!/bin/bash

# Send Help Message to Trigger Bot Menu
# This sends a "Help" command that should trigger the menu

PHONE_NUMBER_ID="883508911504885"
ACCESS_TOKEN="EAAcH41JE6tUBPxQdZCJ8P2wEqfxRin9PuwTYGzd14s0pXFY4BWZBfsvv1dZBaoNsT8xRP4uZBixqg9ia2h8eesmsnUx83xie9qMKpOtECfaJtmoyT6vZAaswqIZBJ04IKV4In2aQdCYkPZBnSPEZBZAU8l6rfPvTyWhVGtwld7BcHrbjGy0PO6sdIuoEF0MXyzZCyW5ZCYxXdcJQDOfaZBGtnYTRD8rCjVbJnmy7eGd4CuXcyzqib2oZD"
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