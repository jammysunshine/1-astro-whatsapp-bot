#!/bin/bash

# Fix syntax errors in service files

echo "🔧 Fixing syntax errors in service files..."

# Fix the 'u' prefix and extra parentheses in constructor calls
find src/core/services -name "*.js" -not -path "*/ServiceTemplate.js" -not -path "*/index.js" -exec sed -i '' "s/super('u\([^']*\)Service'));$/super('\1Service');/g" {} \;

echo "✅ Syntax errors fixed!"
