const { MongoClient } = require('mongodb');

// Load environment variables
require('dotenv').config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI environment variable not set');
    process.exit(1);
  }

  console.log('🔗 Testing MongoDB connection...');
  console.log('URI:', uri.replace(/:([^:@]{4})[^:@]*@/, ':****@'));

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');

    // Test a simple operation
    const db = client.db();
    const collections = await db.collections();
    console.log(`📊 Database has ${collections.length} collections`);

    await client.close();
    console.log('🔌 Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();