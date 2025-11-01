#!/usr/bin/env node

// testRunner.js - Script to run tests for the new services
const { execSync } = require('child_process');
const path = require('path');

// Define the test files to run
const testFiles = [
  'tests/unit/services/core/services/astrologicalThemesAnalysisService.test.js',
  'tests/unit/services/core/services/politicalTimingAnalysisService.test.js',
  'tests/unit/services/core/services/globalStabilityAnalysisService.test.js',
  'tests/unit/services/core/calculators/AstrologicalThemesAnalyzer.test.js',
  'tests/unit/services/core/calculators/PoliticalTimingAnalyzer.test.js',
  'tests/unit/services/core/calculators/GlobalStabilityAnalyzer.test.js'
];

console.log('🧪 Running tests for new astrological services...\n');

let allPassed = true;

testFiles.forEach(testFile => {
  try {
    console.log(`🔍 Testing: ${path.basename(testFile)}`);
    
    // Run the test file with jest
    const output = execSync(`cd /Users/mohitmendiratta/Projects/bots/w1/astro-whatsapp-bot && npx jest ${testFile}`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    
    console.log(`✅ ${path.basename(testFile)}: PASSED`);
    console.log(output.split('\n').slice(-3).join('\n')); // Show last 3 lines (summary)
    console.log('');
  } catch (error) {
    console.log(`❌ ${path.basename(testFile)}: FAILED`);
    console.log('Error output:');
    console.log(error.stdout || error.stderr || error.message);
    console.log('');
    allPassed = false;
  }
});

console.log('🏁 Test run completed.');
if (allPassed) {
  console.log('🎉 All tests passed!');
} else {
  console.log('💥 Some tests failed. Please review the output above.');
  process.exit(1);
}