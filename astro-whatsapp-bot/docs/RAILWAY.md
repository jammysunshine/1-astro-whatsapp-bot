# Railway Deployment Guide for Astro WhatsApp Bot

This comprehensive guide provides step-by-step instructions for deploying the Astro WhatsApp Bot to Railway, including troubleshooting, token management, and deployment best practices.

## Prerequisites

- Railway CLI installed (`npm install -g @railway/cli`)
- Railway account and project created
- WhatsApp Business API access token and credentials
- MongoDB Atlas database (or other MongoDB provider)
- API keys for payment gateways (Stripe, Razorpay) and OpenAI

## Initial Setup

### 1. Link Project to Railway

```bash
# Navigate to project directory
cd astro-whatsapp-bot

# Link to Railway project
railway link

# Select your workspace, project, environment, and service when prompted
```

### 2. Set Environment Variables

Set all required environment variables using Railway CLI:

```bash
# WhatsApp Business API
railway variables --set "W1_WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token"
railway variables --set "W1_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id"
railway variables --set "W1_WHATSAPP_VERIFY_TOKEN=your_verify_token"
railway variables --set "W1_WHATSAPP_APP_SECRET=your_app_secret"

# Database
railway variables --set "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/astro-whatsapp-bot?retryWrites=true&w=majority"

# Security
railway variables --set "JWT_SECRET=your_secure_jwt_secret"

# Payment Gateways
railway variables --set "STRIPE_SECRET_KEY=your_stripe_secret_key"
railway variables --set "RAZORPAY_KEY_ID=your_razorpay_key_id"
railway variables --set "RAZORPAY_KEY_SECRET=your_razorpay_key_secret"

# AI and External APIs
railway variables --set "OPENAI_API_KEY=your_openai_api_key"

# Other settings
railway variables --set "NODE_ENV=production"
railway variables --set "LOG_LEVEL=info"
railway variables --set "W1_SKIP_WEBHOOK_SIGNATURE=false"  # Set to false in production
```

### 3. View Current Variables

```bash
# View all variables
railway variables

# View variables in key-value format
railway variables --kv
```

## Deployment

### Deploy to Railway

```bash
# Deploy the application
railway up
```

Railway will automatically build and deploy your application using the `Dockerfile` and `package.json` scripts.

### Check Deployment Status

```bash
# View deployment logs
railway logs

# View service status
railway service

# Get public domain
railway domain
```

## Post-Deployment Configuration

### 1. Configure WhatsApp Webhook

1. Go to your WhatsApp Business API dashboard
2. Set the webhook URL to: `https://your-railway-domain.up.railway.app/webhook`
3. Set the verify token to match `W1_WHATSAPP_VERIFY_TOKEN`
4. Subscribe to the following webhook fields:
   - `messages`
   - `message_deliveries`
   - `message_echoes`

### 2. Test the Deployment

```bash
# Test health check endpoint
curl https://your-railway-domain.up.railway.app/health

# Send a test message to your WhatsApp number
# The bot should respond according to your conversation flows
```

## WhatsApp Token Management

### Automated Token Monitoring

The application includes automated WhatsApp token monitoring to handle free tier token expiry:

```bash
# Check token validity
npm run check-token

# Start token monitoring service
npm run monitor-token

# Update token manually
npm run update-token YOUR_NEW_TOKEN_HERE
```

### Token Expiry Handling

When a token expires (free tier expires hourly):

1. **Automatic Detection**: System checks token validity every 30 minutes
2. **Log Monitoring**: Scans Railway logs for authentication errors
3. **Notifications**: Logs critical alerts for token expiry
4. **Manual Update**: Provides clear instructions for token regeneration

### Quick Token Update

Use the provided script for fast token updates:

```bash
# Make script executable (first time only)
chmod +x scripts/update-whatsapp-token.sh

# Update token
./scripts/update-whatsapp-token.sh YOUR_NEW_TOKEN_HERE
```

### Token Expiry Workflow

1. **Detection**: Token monitor detects expiry
2. **Alert**: System logs critical error with instructions
3. **Regeneration**: Go to Facebook Developer Console → WhatsApp → API Setup
4. **Update**: Run the update script with new token
5. **Verification**: System automatically validates and confirms

## Cron Jobs Configuration

Configured in `railway.toml`:
- Token monitoring every 30 minutes
- Daily health reports at 9 AM

## Useful Railway Commands

### Project Management
```bash
# List projects
railway projects

# Switch environment
railway environment

# List services
railway services
```

### Variables Management
```bash
# Set multiple variables at once
railway variables --set "KEY1=value1" --set "KEY2=value2"

# Delete a variable
railway variables --unset "KEY_NAME"

# Skip deployment when setting variables
railway variables --set "KEY=value" --skip-deploys
```

### Monitoring and Debugging
```bash
# View real-time logs
railway logs --follow

# View logs for specific service
railway logs -s service-name

# Connect to database (if using Railway's database)
railway connect
```

### Redeployment
```bash
# Redeploy after code changes
railway up

# Redeploy specific service
railway up -s service-name
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `W1_WHATSAPP_ACCESS_TOKEN` | WhatsApp Business API access token | Yes |
| `W1_WHATSAPP_PHONE_NUMBER_ID` | WhatsApp phone number ID | Yes |
| `W1_WHATSAPP_VERIFY_TOKEN` | Webhook verification token | Yes |
| `W1_WHATSAPP_APP_SECRET` | WhatsApp app secret | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | No |
| `RAZORPAY_KEY_ID` | Razorpay key ID | No |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | No |
| `OPENAI_API_KEY` | OpenAI API key | No |
| `NODE_ENV` | Environment (production/development) | Yes |
| `LOG_LEVEL` | Logging level (info/debug/error) | No |
| `W1_SKIP_WEBHOOK_SIGNATURE` | Skip webhook signature validation (false in prod) | No |

## Troubleshooting

### Token Management Issues

#### Issue: Bot Using Expired Token Despite Valid Token in Railway Variables
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

### Common Issues

1. **Deployment fails**: Check logs with `railway logs`
2. **Webhook not receiving messages**: Verify webhook URL and token in WhatsApp dashboard
3. **Database connection fails**: Ensure MongoDB URI is correct and accessible
4. **Environment variables not set**: Use `railway variables` to verify
5. **WhatsApp token expired**: Use `npm run update-token NEW_TOKEN` to update

### Health Checks

The application includes health check endpoints:
- `GET /health` - General health status
- `GET /health/whatsapp` - WhatsApp API connectivity
- `GET /health/database` - Database connectivity

## Deployment Notes

- Railway deployment via `railway up` is more reliable than git-based deployment for environment variable changes
- Always verify token validity after deployment changes
- Use `railway logs --tail 50` to monitor for token expiry errors

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets for JWT and API keys
- Enable webhook signature validation in production
- Regularly rotate access tokens and secrets
- Monitor logs for security issues

## Performance Optimization

- Railway automatically scales based on usage
- Monitor performance with `railway logs` and application metrics
- Consider using Railway's Redis for caching if needed
- Optimize database queries and use connection pooling

## Support

For Railway-specific issues, refer to [Railway Documentation](https://docs.railway.app/).
For application-specific issues, check the main README.md and logs.