#!/bin/bash

# Improved script to fix all services to follow COMPLETE_90_SERVICES_IMPLEMENTATION_GUIDE.md pattern

echo "🔧 Starting improved automated service fixes..."

# Function to capitalize first letter
capitalize() {
    echo "$1" | sed 's/.*/\u&/'
}

# Find all services that need fixing
find src/core/services -name "*.js" -not -path "*/ServiceTemplate.js" -exec grep -l "super(new" {} \; | while read file; do
    echo "📝 Fixing: $file"
    
    # Extract service name from filename
    filename=$(basename "$file" .js)
    service_name=$(capitalize "$filename")
    
    echo "   Service name: $service_name"
    
    # Create backup
    cp "$file" "${file}.backup"
    
    # Use sed to make replacements
    # 1. Fix constructor
    sed -i '' "s/super(new [^)]*)/super('$service_name')/" "$file"
    
    # 2. Add calculatorPath property after constructor
    sed -i '' "/super('$service_name');/a\\
    this.calculatorPath = 'NEEDS_MANUAL_REVIEW';" "$file"
    
    # 3. Add initialize method after calculatorPath
    sed -i '' "/this\.calculatorPath = 'NEEDS_MANUAL_REVIEW';/a\\
  \\
  async initialize() {\\
    try {\\
      await super.initialize();\\
      logger.info('✅ $service_name initialized successfully');\\
    } catch (error) {\\
      logger.error('❌ Failed to initialize $service_name:', error);\\
      throw error;\\
    }\\
  }" "$file"
    
    # 4. Add getHealthStatus method at the end (before module.exports)
    sed -i '' "/^}/i\\
  async getHealthStatus() {\\
    try {\\
      const baseHealth = await super.getHealthStatus();\\
      return {\\
        ...baseHealth,\\
        features: {\\
          // Add service-specific features here\\
        },\\
        supportedAnalyses: [\\
          // Add supported analyses here\\
        ]\\
      };\\
    } catch (error) {\\
      return {\\
        status: 'unhealthy',\\
        error: error.message,\\
        timestamp: new Date().toISOString()\\
      };\\
    }\\
  }\\
" "$file"
    
    echo "✅ Fixed: $file"
done

echo "🎉 All services have been updated with basic structure fixes."
echo "⚠️  Manual review required for calculatorPath properties."
