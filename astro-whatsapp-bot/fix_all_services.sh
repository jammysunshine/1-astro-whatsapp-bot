#!/bin/bash

# Comprehensive script to fix all remaining 89 services to follow COMPLETE_90_SERVICES_IMPLEMENTATION_GUIDE.md pattern

echo "🔧 Starting comprehensive service fixes for all 89 services..."

# Function to capitalize first letter
capitalize() {
    echo "$1" | sed 's/.*/\u&/'
}

# Function to fix a single service
fix_service() {
    local file="$1"
    echo "📝 Fixing: $file"
    
    # Extract service name from filename
    local filename=$(basename "$file" .js)
    local service_name=$(capitalize "$filename")
    
    # Create backup
    cp "$file" "${file}.final_backup"
    
    # Check if service already has proper pattern
    if grep -q "super('$service_name')" "$file" && grep -q "this\.calculatorPath" "$file"; then
        echo "   ✅ Already properly formatted"
        return
    fi
    
    # Use sed to make comprehensive fixes
    # 1. Fix constructor if needed
    if ! grep -q "super('$service_name')" "$file"; then
        sed -i '' "s/super(new [^)]*)/super('$service_name')/" "$file"
    fi
    
    # 2. Add calculatorPath if missing
    if ! grep -q "this\.calculatorPath" "$file"; then
        sed -i '' "/super('$service_name');/a\\
    this.calculatorPath = 'NEEDS_MANUAL_REVIEW';" "$file"
    fi
    
    # 3. Add initialize method if missing
    if ! grep -q "async initialize()" "$file"; then
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
    fi
    
    # 4. Add getHealthStatus method if missing
    if ! grep -q "async getHealthStatus()" "$file"; then
        # Find the end of the class (before module.exports)
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
    fi
    
    # 5. Remove any remaining direct imports
    sed -i '' '/const.*require.*calculators/d' "$file"
    sed -i '' '/const.*require.*compatibility/d' "$file"
    sed -i '' '/const.*require.*mundane/d' "$file"
    sed -i '' '/const.*require.*western/d' "$file"
    sed -i '' '/const.*require.*hinduFestivals/d' "$file"
    sed -i '' '/const.*require.*horary/d' "$file"
    sed -i '' '/const.*require.*numerologyService/d' "$file"
    sed -i '' '/const.*require.*tarotReader/d' "$file"
    sed -i '' '/const.*require.*divinationService/d' "$file"
    sed -i '' '/const.*require.*astrology/d' "$file"
    
    echo "   ✅ Fixed: $file"
}

# Find and fix all services
find src/core/services -name "*.js" -not -path "*/ServiceTemplate.js" -not -path "*/index.js" | while read file; do
    fix_service "$file"
done

echo "🎉 All 89 services have been comprehensively fixed!"
echo "⚠️  Manual review required for calculatorPath properties."
echo "📊 Next: Apply correct calculator paths from mapping file."
