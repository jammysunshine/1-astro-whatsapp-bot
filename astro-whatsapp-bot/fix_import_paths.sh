#!/bin/bash
# AUTOMATED IMPORT PATH FIXING SCRIPT

echo "🔧 Automated Import Path Fixing"

# Define mappings - old service path -> new calculator/service path
declare -A PATH_MAPPINGS=(
    ["/src/services/astrology/horary"]="src/core/services/calculators/horaryReadingService"
    ["/src/services/astrology/nadi"]="src/core/services/calculators/nadiAstrologyService" 
    ["/src/services/astrology/kabbalah"]="src/core/services/calculators/kabbalisticAstrologyService"
    ["/src/services/astrology/mayan"]="src/core/services/calculators/mayanAstrologyService"
    ["/src/services/astrology/chineseCalculator"]="src/core/services/calculators/chineseAstrologyService"
    ["/src/services/astrology/astrocartographyReader"]="src/core/services/calculators/astrocartographyReader"
    ["/src/services/astrology/astrologyEngine"]="src/core/services/calculators/CalculationsCoordinator"
    ["/src/services/astrology/birthChartService"]="src/core/services/birthChartService"
    ["/src/services/astrology/dailyHoroscopeService"]="src/core/services/dailyHoroscopeService"
)

echo "Found mappings for ${#PATH_MAPPINGS[@]} service paths"

# Process each mapping
for OLD_PATH in "${!PATH_MAPPINGS[@]}"; do
    NEW_PATH="${PATH_MAPPINGS[$OLD_PATH]}"
    
    echo "🔍 Processing mapping: $OLD_PATH -> $NEW_PATH"
    
    # Find files containing old import path
    FILES_WITH_OLD_PATH=$(find . -name "*.js" -not -path "./node_modules/*" -exec grep -l "$OLD_PATH" {} \;)
    
    if [ -n "$FILES_WITH_OLD_PATH" ]; then
        echo "  Found $(echo "$FILES_WITH_OLD_PATH" | wc -l) files needing update"
        
        # Process each file
        while IFS= read -r FILE; do
            if [ -f "$FILE" ]; then
                echo "    Updating $FILE"
                
                # Backup original
                cp "$FILE" "${FILE}.bak"
                
                # Replace old path with new path
                sed -i.bak "s|$OLD_PATH|$NEW_PATH|g" "$FILE"
                
                if grep -q "$NEW_PATH" "$FILE"; then
                    echo "      ✅ Updated successfully"
                else
                    echo "      ❌ Update failed, restoring backup"
                    mv "${FILE}.bak" "$FILE"
                fi
                
                # Clean up
                rm -f "${FILE}.bak"
            fi
        done <<< "$FILES_WITH_OLD_PATH"
    else
        echo "  No files found using $OLD_PATH"
    fi
done

echo "✅ Automated import path fixing complete"
echo "Manual review may still be needed for complex cases"
