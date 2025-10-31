#!/bin/bash

# Script to apply calculator paths to all services

echo "🔧 Applying calculator paths to all services..."

# Read the mapping file and apply paths
while IFS=':' read -r service_file calculator_path; do
    # Skip comments and empty lines
    [[ $service_file =~ ^#.*$ ]] && continue
    [[ -z $service_file ]] && continue
    
    # Find the service file
    service_path=$(find src/core/services -name "$service_file" 2>/dev/null)
    
    if [[ -n $service_path ]]; then
        echo "📝 Updating: $service_path"
        
        # Replace the placeholder with the actual path
        sed -i '' "s|this\.calculatorPath = 'NEEDS_MANUAL_REVIEW';|this.calculatorPath = '$calculator_path';|" "$service_path"
        
        echo "✅ Updated: $service_path"
    else
        echo "⚠️  Service file not found: $service_file"
    fi
done < calculator_paths.txt

echo "🎉 Calculator paths applied to all services!"
