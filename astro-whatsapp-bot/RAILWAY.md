# Railway Deployment Notes

## Token Management Issues

### Issue: Bot Using Expired Token Despite Valid Token in Railway Variables
**Date:** October 25, 2025
**Problem:** Bot was using an expired WhatsApp token even though Railway environment variables contained a valid token.

**Symptoms:**
- Webhook receives messages successfully
- Bot fails to send responses with "Session has expired" error
- Token validation via `railway run npm run check-token` shows valid token
- Bot logs show old expired token being used

**Root Cause:**
- Bot was using cached or old token value
- Redeployment didn't pick up new environment variables
- Token mismatch between Railway variables and running application

**Solution:**
1. Update token in Railway environment variables
2. Use `railway up` to force redeployment (not git-based deployment)
3. Verify token is working by checking logs after redeployment

**Commands Used:**
```bash
# Check current token
railway run npm run check-token

# Update token (if needed)
railway variables --set "W1_WHATSAPP_ACCESS_TOKEN=NEW_TOKEN"

# Force redeployment
railway up
```

**Prevention:**
- Always use `railway up` for deployments when environment variables change
- Monitor token expiry proactively using the token manager cron job
- Set up alerts for token expiry detection

## Cron Jobs Configuration

Configured in `railway.toml`:
- Token monitoring every 30 minutes
- Daily health reports at 9 AM

## Deployment Notes

- Railway deployment via `railway up` is more reliable than git-based deployment for environment variable changes
- Always verify token validity after deployment changes
- Use `railway logs --tail 50` to monitor for token expiry errors