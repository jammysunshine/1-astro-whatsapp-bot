class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  log(message, ...args) {
    console.log(`[${this.context}] ${message}`, ...args);
  }

  error(message, ...args) {
    console.error(`[${this.context}] ERROR: ${message}`, ...args);
  }

  warn(message, ...args) {
    console.warn(`[${this.context}] WARN: ${message}`, ...args);
  }

  debug(message, ...args) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.context}] DEBUG: ${message}`, ...args);
    }
  }
}

// Export a singleton instance of the Logger
module.exports = new Logger('Global');