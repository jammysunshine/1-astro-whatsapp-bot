# WhatsApp Token Management System

## Overview

This system provides automated monitoring and management of WhatsApp Business API access tokens, specifically designed to handle the frequent expiry issues with free tier accounts.

## Problem Statement

- **Free Tier Limitation**: WhatsApp access tokens expire every hour
- **Manual Process**: Requires visiting Facebook Developer Console, reconnecting account, regenerating token
- **Downtime**: Bot becomes unresponsive during token expiry
- **Maintenance Overhead**: Frequent manual intervention required

## Solution Architecture

### Components

1. **Token Health Monitor** (`scripts/whatsapp-token-manager.js`)
   - Validates token health every 30 minutes
   - Monitors Railway logs for authentication errors
   - Provides automated alerts and recovery instructions

2. **Quick Update Script** (`scripts/update-whatsapp-token.sh`)
   - One-command token updates
   - Validates token before updating Railway
   - Provides immediate feedback

3. **Railway Integration**
   - Environment variable management
   - Automated deployment on token updates
   - Log monitoring capabilities

## Setup

### 1. Environment Variables

Ensure these variables are set in Railway:

```bash
# Required for token management
W1_WHATSAPP_ACCESS_TOKEN=your_current_token
W1_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
W1_WHATSAPP_APP_SECRET=your_app_secret

# Optional: For automated Railway updates
RAILWAY_TOKEN=your_project_token_from_railway_dashboard
```

### 2. Railway Cron Job (Optional)

Add to your Railway configuration for automated monitoring:

```json
{
  "cron": [
    {
      "name": "whatsapp-token-monitor",
      "schedule": "*/30 * * * *",
      "command": "npm run check-token",
      "timeout": 300
    }
  ]
}
```

## Usage

### Manual Token Validation

```bash
# Check if current token is valid
npm run check-token
```

### Start Monitoring Service

```bash
# Start continuous monitoring (for development)
npm run monitor-token
```

### Update Token (Quick Method)

```bash
# Update token with validation
npm run update-token YOUR_NEW_TOKEN_HERE
```

### Update Token (Script Method)

```bash
# Make executable (first time)
chmod +x scripts/update-whatsapp-token.sh

# Update token
./scripts/update-whatsapp-token.sh YOUR_NEW_TOKEN_HERE
```

## Token Expiry Workflow

### Automatic Detection

- System checks token validity every 30 minutes
- Scans Railway logs for authentication errors
- Logs warnings when token is near expiry

### Manual Intervention Required

When token expires, the system will:

1. **Log Critical Alert**:

   ```
   🚨 WHATSAPP TOKEN EXPIRED - MANUAL UPDATE REQUIRED 🚨
   ```

2. **Provide Clear Instructions**:
   - Steps to regenerate token in Facebook Developer Console
   - Commands to update Railway environment variable
   - Verification steps

### Token Regeneration Steps

1. **Visit Facebook Developer Console**:

   ```
   https://developers.facebook.com/apps/
   ```

2. **Navigate to WhatsApp Setup**:
   - Select your app
   - Go to WhatsApp → API Setup

3. **Regenerate Token**:
   - Click "Add Access Token"
   - Select your WhatsApp Business Account
   - Copy the new token

4. **Update in Railway**:

   ```bash
   npm run update-token YOUR_NEW_TOKEN_HERE
   ```

5. **Verify**:
   ```bash
   npm run check-token
   railway logs --tail 10
   ```

## Monitoring & Alerts

### Log Monitoring

The system monitors for these error patterns:

- `token.*expir`
- `invalid.*token`
- `unauthorized`
- `authentication.*fail`
- `403.*forbidden`
- `401.*unauthorized`

### Alert Levels

- **INFO**: Routine token checks
- **WARNING**: Token validation issues
- **ERROR**: Token validation failures
- **CRITICAL**: Token expired, manual intervention required

## Advanced Features

### Log Analysis

```bash
# Check logs for token errors
npm run token-manager logs
```

### Custom Monitoring Intervals

Modify the check interval in `whatsapp-token-manager.js`:

```javascript
this.checkInterval = 15 * 60 * 1000; // 15 minutes
```

### Notification Integration

Extend the `sendNotification` method to integrate with:

- Email services (SendGrid, Mailgun)
- SMS services (Twilio)
- Slack/Discord webhooks
- Telegram bots

## Security Considerations

### Token Storage

- Tokens are stored as Railway environment variables
- Never commit tokens to version control
- Use Railway's secret management features

### Access Control

- Limit Railway project access to trusted team members
- Use Railway's project-scoped tokens for automation
- Regularly rotate tokens when possible

## Limitations & Future Improvements

### Current Limitations

- **Free Tier**: Automatic refresh not possible, manual intervention required
- **Detection**: Relies on API calls and log parsing
- **Paid Tier**: Could implement automatic refresh for system user tokens

### Future Enhancements

1. **Automatic Refresh**: For paid WhatsApp Business API accounts
2. **Webhook Integration**: Real-time token expiry notifications
3. **Multi-Token Support**: Backup tokens for seamless switching
4. **Analytics Dashboard**: Token health metrics and expiry predictions

## Support

### Common Issues

**Token update fails**:

```bash
# Check Railway CLI authentication
railway status

# Verify token format
npm run check-token YOUR_TOKEN_HERE
```

**Monitoring not working**:

```bash
# Check environment variables
railway variables

# Test manual validation
npm run check-token
```

**Logs not showing errors**:

```bash
# Check Railway logs directly
railway logs --follow

# Verify log parsing
npm run token-manager logs
```

## Contributing

When modifying the token management system:

1. Test all commands locally first
2. Update documentation for new features
3. Ensure backward compatibility
4. Add appropriate error handling
5. Update the troubleshooting section

## API Reference

### WhatsAppTokenManager Class

#### Methods

- `validateToken(token)`: Test token validity
- `checkRailwayLogs()`: Scan logs for errors
- `updateRailwayToken(token)`: Update Railway env var
- `sendNotification(message, level)`: Send alerts
- `startMonitoring()`: Begin continuous monitoring

#### CLI Commands

- `check`: Validate current token
- `monitor`: Start monitoring service
- `logs`: Check for log errors
- `update TOKEN`: Update token manually
