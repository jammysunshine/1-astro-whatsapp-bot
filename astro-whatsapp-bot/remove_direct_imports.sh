#!/bin/bash

# Script to remove direct calculator imports from remaining services

echo "🧹 Removing direct calculator imports from remaining services..."

# Find services that still have direct calculator imports
find src/core/services -name "*.js" -not -path "*/ServiceTemplate.js" -exec grep -l "require.*calculators" {} \; | while read file; do
    echo "📝 Cleaning: $file"
    
    # Create backup
    cp "$file" "${file}.backup2"
    
    # Remove direct calculator import lines
    sed -i '' '/const.*require.*calculators/d' "$file"
    sed -i '' '/const.*require.*compatibility/d' "$file" 
    sed -i '' '/const.*require.*mundane/d' "$file"
    sed -i '' '/const.*require.*western/d' "$file"
    sed -i '' '/const.*require.*hinduFestivals/d' "$file"
    sed -i '' '/const.*require.*horary/d' "$file"
    sed -i '' '/const.*require.*numerologyService/d' "$file"
    sed -i '' '/const.*require.*tarotReader/d' "$file"
    sed -i '' '/const.*require.*divinationService/d' "$file"
    
    echo "✅ Cleaned: $file"
done

echo "🎉 Direct calculator imports removed from all services!"
