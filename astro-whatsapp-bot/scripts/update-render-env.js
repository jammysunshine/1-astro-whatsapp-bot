#!/usr/bin/env node

/**
 * update-render-env.js
 * Script to update environment variables on Render service using Render API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration - will be read from .env file
const RENDER_API_BASE = 'https://api.render.com/v1';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`Error: ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(message, 'green');
}

// Function to parse .env file
function parseEnvFile(filePath) {
  const envVars = {};
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
        envVars[key] = value;
      }
    }
  }

  return envVars;
}

// Function to make HTTPS request to Render API
function makeRequest(endpoint, method, data = null, apiKey) {
  return new Promise((resolve, reject) => {
    const url = `${RENDER_API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}, Body: '${body}'`);
        try {
          const response = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`API request failed: ${res.statusCode} - ${response.message || body}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Function to update environment variables
async function updateEnvVars(envVars, apiKey, serviceId) {
  log('Updating environment variables on Render...', 'blue');

  // Filter out sensitive or Render-specific vars that shouldn't be synced
  const filteredVars = {};
  const excludeKeys = ['RENDER_API_KEY', 'RENDER_SERVICE_ID', 'NODE_ENV', 'PORT'];

  for (const [key, value] of Object.entries(envVars)) {
    if (!excludeKeys.includes(key) && value && value !== 'your_' + key.toLowerCase().replace(/_/g, '_') + '_here') {
      filteredVars[key] = value;
    }
  }

  log(`Found ${Object.keys(filteredVars).length} environment variables to update`);

  try {
    // Get current env vars
    const currentVars = await makeRequest(`/services/${serviceId}/env-vars`, 'GET', null, apiKey);
    const currentVarMap = {};
    currentVars.forEach(v => {
      currentVarMap[v.key] = v;
    });

    // Update or create env vars
    for (const [key, value] of Object.entries(filteredVars)) {
      const existing = currentVarMap[key];
      const envVarData = {
        key,
        value,
        type: 'shared' // or 'secret' for sensitive data
      };

      if (existing) {
        // Update existing
        await makeRequest(`/services/${serviceId}/env-vars/${existing.id}`, 'PUT', envVarData, apiKey);
        log(`Updated: ${key}`, 'yellow');
      } else {
        // Create new
        await makeRequest(`/services/${serviceId}/env-vars`, 'POST', envVarData, apiKey);
        log(`Created: ${key}`, 'green');
      }
    }

    success('Environment variables updated successfully on Render!');
    log('Note: You may need to redeploy your service for changes to take effect.', 'yellow');

  } catch (e) {
    error(`Failed to update environment variables: ${e.message}`);
  }
}

// Main function
async function main() {
  log('Render Environment Variables Update Script', 'blue');
  log('==========================================');

  // Find .env file
  const envFilePath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envFilePath)) {
    error('.env file not found in current directory');
  }

  log(`Reading environment variables from: ${envFilePath}`);

  // Parse .env file
  const envVars = parseEnvFile(envFilePath);
  log(`Parsed ${Object.keys(envVars).length} variables from .env file`);

  // Get API key and service ID from env vars
  const RENDER_API_KEY = envVars.RENDER_API_KEY;
  const RENDER_SERVICE_ID = envVars.RENDER_SERVICE_ID;

  if (!RENDER_API_KEY) {
    error('RENDER_API_KEY not found in .env file. Please add it.');
  }

  if (!RENDER_SERVICE_ID) {
    error('RENDER_SERVICE_ID not found in .env file. Please add it.');
  }

  // Update Render
  await updateEnvVars(envVars, RENDER_API_KEY, RENDER_SERVICE_ID);
}

// Run the script
if (require.main === module) {
  main().catch((e) => {
    error(e.message);
  });
}

module.exports = { updateEnvVars, parseEnvFile };