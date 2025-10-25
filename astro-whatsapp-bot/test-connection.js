const mongoose = require('mongoose');

// Load environment variables from .env if available
require('dotenv').config();

const dbUser = process.env.DB_USER || 'jammysunshine';
const dbPassword = process.env.DB_PASSWORD || '11wMGp1fnrwhZGIQ';
const dbHost = process.env.DB_HOST || 'cluster0.qqweu91.mongodb.net';
const dbName = process.env.DB_NAME || 'astro-whatsapp-bot';

const mongoURI = `mongodb+srv://${dbUser}:${dbPassword}@${dbHost}/${dbName}?retryWrites=true&w=majority`;

console.log('Testing MongoDB connection...');

mongoose.connect(mongoURI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});

mongoose.connection.on('connected', async () => {
  console.log('✅ Successfully connected to MongoDB Atlas');
  await mongoose.connection.close();
  console.log('Connection closed');
  process.exit(0);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});

mongoose.connection.on('timeout', () => {
  console.error('❌ Connection timeout');
  process.exit(1);
});