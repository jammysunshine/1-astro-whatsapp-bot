module.exports = {
  url: process.env.CORE_DB_URL || 'mongodb://localhost:27017/astro-core',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
  // Add other database configs
};
