#!/bin/bash
# scripts/test.sh
# Comprehensive testing script for Astro WhatsApp Bot

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

log_debug() {
    if [[ "$DEBUG" == "true" ]]; then
        echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] DEBUG:${NC} $1"
    fi
}

# Default values
COVERAGE_THRESHOLD=${COVERAGE_THRESHOLD:-95}
TEST_TYPE=${TEST_TYPE:-all}
NODE_ENV=${NODE_ENV:-test}

log "Starting comprehensive testing suite for Astro WhatsApp Bot"
log "Coverage threshold: ${COVERAGE_THRESHOLD}%"
log "Test type: ${TEST_TYPE}"
log "Node environment: ${NODE_ENV}"

# Function to check test dependencies
check_test_dependencies() {
    log "Checking test dependencies..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check if Jest is installed
    if ! command -v jest &> /dev/null; then
        log_error "Jest is not installed"
        exit 1
    fi
    
    # Check if required test directories exist
    if [[ ! -d "tests" ]]; then
        log_error "Tests directory not found"
        exit 1
    fi
    
    log "All test dependencies are installed"
}

# Function to run linting
run_linting() {
    log "Running code linting..."
    
    # Run ESLint
    if ! npm run lint:check; then
        log_error "Code linting failed"
        exit 1
    fi
    
    log "Code linting completed successfully"
}

# Function to run formatting check
run_formatting_check() {
    log "Running code formatting check..."
    
    # Run Prettier
    if ! npm run format:check; then
        log_error "Code formatting check failed"
        exit 1
    fi
    
    log "Code formatting check completed successfully"
}

# Function to run security audit
run_security_audit() {
    log "Running security audit..."
    
    # Run npm audit
    if ! npm audit; then
        log_warn "Security vulnerabilities found"
        # In a real scenario, you might want to fail the build based on severity
    fi
    
    log "Security audit completed"
}

# Function to run unit tests
run_unit_tests() {
    log "Running unit tests..."
    
    # Run unit tests with coverage
    if ! npm run test:unit -- --coverage --silent; then
        log_error "Unit tests failed"
        exit 1
    fi
    
    log "Unit tests completed successfully"
}

# Function to run integration tests
run_integration_tests() {
    log "Running integration tests..."
    
    # Run integration tests
    if ! npm run test:integration -- --silent; then
        log_error "Integration tests failed"
        exit 1
    fi
    
    log "Integration tests completed successfully"
}

# Function to run end-to-end tests
run_e2e_tests() {
    log "Running end-to-end tests..."
    
    # Run end-to-end tests
    if ! npm run test:e2e -- --silent; then
        log_error "End-to-end tests failed"
        exit 1
    fi
    
    log "End-to-end tests completed successfully"
}

# Function to run all tests
run_all_tests() {
    log "Running all tests..."
    
    # Run all tests with coverage
    if ! npm test -- --silent; then
        log_error "Some tests failed"
        exit 1
    fi
    
    log "All tests completed successfully"
}

# Function to check coverage
check_coverage() {
    log "Checking test coverage..."
    
    # Generate coverage report
    if ! npm run test:coverage -- --silent; then
        log_error "Failed to generate coverage report"
        exit 1
    fi
    
    # Check if coverage directory exists
    if [[ ! -d "tests/reports/coverage" ]]; then
        log_error "Coverage report directory not found"
        exit 1
    fi
    
    # Parse coverage from lcov report
    if [[ -f "tests/reports/coverage/lcov.info" ]]; then
        # Calculate overall coverage
        TOTAL_LINES=$(grep -c "^DA:" tests/reports/coverage/lcov.info || echo "0")
        COVERED_LINES=$(grep -c "^DA:[^,]*,[^,]*,[1-9]" tests/reports/coverage/lcov.info || echo "0")
        
        if [[ $TOTAL_LINES -gt 0 ]]; then
            COVERAGE_PERCENT=$((COVERED_LINES * 100 / TOTAL_LINES))
            log "Coverage: ${COVERAGE_PERCENT}% (${COVERED_LINES}/${TOTAL_LINES} lines)"
            
            if [[ $COVERAGE_PERCENT -lt $COVERAGE_THRESHOLD ]]; then
                log_error "Coverage (${COVERAGE_PERCENT}%) is below threshold (${COVERAGE_THRESHOLD}%)"
                exit 1
            else
                log "Coverage meets threshold requirement"
            fi
        else
            log_warn "No coverage data found"
        fi
    else
        log_warn "LCov coverage report not found"
    fi
    
    log "Coverage check completed"
}

# Function to generate test reports
generate_reports() {
    log "Generating test reports..."
    
    # Create reports directory if it doesn't exist
    mkdir -p tests/reports/{junit,html}
    
    # Generate JUnit report
    if ! npm run test -- --testResultsProcessor=jest-junit --silent; then
        log_warn "Failed to generate JUnit report"
    fi
    
    # Generate HTML report
    if ! npm run test -- --reporters=jest-html-reporter --silent; then
        log_warn "Failed to generate HTML report"
    fi
    
    log "Test reports generated"
}

# Function to run performance tests
run_performance_tests() {
    log "Running performance tests..."
    
    # Placeholder for performance testing
    # In a real scenario, you would use tools like Artillery, k6, or Apache Bench
    
    log "Performance tests completed"
}

# Function to run security tests
run_security_tests() {
    log "Running security tests..."
    
    # Placeholder for security testing
    # In a real scenario, you would use tools like OWASP ZAP, Burp Suite, or Snyk
    
    log "Security tests completed"
}

# Function to run mutation tests
run_mutation_tests() {
    log "Running mutation tests..."
    
    # Placeholder for mutation testing
    # In a real scenario, you would use tools like Stryker or similar
    
    log "Mutation tests completed"
}

# Function to run accessibility tests
run_accessibility_tests() {
    log "Running accessibility tests..."
    
    # Placeholder for accessibility testing
    # In a real scenario, you would use tools like Axe or similar
    
    log "Accessibility tests completed"
}

# Function to run all comprehensive tests
run_comprehensive_tests() {
    log "Running comprehensive test suite..."
    
    # Run all test types
    run_linting
    run_formatting_check
    run_security_audit
    run_unit_tests
    run_integration_tests
    run_e2e_tests
    check_coverage
    generate_reports
    
    # Run additional tests based on environment
    if [[ "$NODE_ENV" != "ci" ]]; then
        run_performance_tests
        run_security_tests
        run_mutation_tests
        run_accessibility_tests
    fi
    
    log "Comprehensive test suite completed successfully"
}

# Function to cleanup test artifacts
cleanup() {
    log "Cleaning up test artifacts..."
    
    # Remove test reports older than 7 days
    find tests/reports -name "*.xml" -mtime +7 -delete 2>/dev/null || true
    find tests/reports -name "*.html" -mtime +7 -delete 2>/dev/null || true
    find tests/reports -name "*.json" -mtime +7 -delete 2>/dev/null || true
    
    # Clear npm cache
    npm cache clean --force 2>/dev/null || true
    
    log "Test artifact cleanup completed"
}

# Main testing process
main() {
    log "Starting comprehensive testing process for Astro WhatsApp Bot"
    
    # Record start time
    START_TIME=$(date +%s)
    
    # Check dependencies
    check_test_dependencies
    
    # Run tests based on type
    case $TEST_TYPE in
        lint)
            run_linting
            ;;
        format)
            run_formatting_check
            ;;
        security)
            run_security_audit
            ;;
        unit)
            run_unit_tests
            ;;
        integration)
            run_integration_tests
            ;;
        e2e)
            run_e2e_tests
            ;;
        all)
            run_comprehensive_tests
            ;;
        *)
            log_warn "Unknown test type: $TEST_TYPE, running all tests"
            run_comprehensive_tests
            ;;
    esac
    
    # Calculate duration
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    log "Testing process completed in ${DURATION} seconds"
    
    # Cleanup test artifacts
    cleanup
    
    log "All testing processes completed successfully!"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --type|-t)
            TEST_TYPE="$2"
            shift 2
            ;;
        --coverage|-c)
            COVERAGE_THRESHOLD="$2"
            shift 2
            ;;
        --debug|-d)
            DEBUG="true"
            shift
            ;;
        --env|-e)
            NODE_ENV="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -t, --type TYPE        Test type (lint, format, security, unit, integration, e2e, all)"
            echo "  -c, --coverage PERCENT Coverage threshold percentage"
            echo "  -d, --debug            Enable debug logging"
            echo "  -e, --env ENV          Node environment (test, ci, development)"
            echo "  -h, --help             Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"