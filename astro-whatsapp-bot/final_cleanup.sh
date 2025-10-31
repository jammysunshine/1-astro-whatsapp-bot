#!/bin/bash

# Final cleanup script to complete service architecture fixes

echo "🧹 Final cleanup of remaining services..."

# Remove remaining direct imports more aggressively
find src/core/services -name "*.js" -not -path "*/ServiceTemplate.js" -not -path "*/index.js" -exec grep -l "require.*calculators\|require.*compatibility\|require.*mundane\|require.*western\|require.*hinduFestivals\|require.*horary\|require.*numerologyService\|require.*tarotReader\|require.*divinationService" {} \; | while read file; do
    echo "🧽 Final cleaning: $file"
    
    # Remove all remaining direct calculator imports
    sed -i '' '/const.*require.*calculators/d' "$file"
    sed -i '' '/const.*require.*compatibility/d' "$file"
    sed -i '' '/const.*require.*mundane/d' "$file"
    sed -i '' '/const.*require.*western/d' "$file"
    sed -i '' '/const.*require.*hinduFestivals/d' "$file"
    sed -i '' '/const.*require.*horary/d' "$file"
    sed -i '' '/const.*require.*numerologyService/d' "$file"
    sed -i '' '/const.*require.*tarotReader/d' "$file"
    sed -i '' '/const.*require.*divinationService/d' "$file"
    
    # Also remove any remaining import patterns
    sed -i '' '/const.*= require.*astrology/d' "$file"
    
    echo "✅ Final cleaned: $file"
done

echo "🎉 Final cleanup completed!"
