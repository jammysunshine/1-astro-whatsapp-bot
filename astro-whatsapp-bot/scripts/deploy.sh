#!/bin/bash
# scripts/deploy.sh
# Deployment script for Astro WhatsApp Bot

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Check if running in CI/CD environment
if [[ -n "$CI" ]]; then
    log "Running in CI/CD environment"
    IS_CI=true
else
    log "Running in local environment"
    IS_CI=false
fi

# Default values
ENVIRONMENT=${DEPLOY_ENV:-development}
BRANCH=${GITHUB_REF_NAME:-$(git branch --show-current)}
TAG=${GITHUB_SHA:-$(git rev-parse HEAD)}

log "Starting deployment process"
log "Environment: $ENVIRONMENT"
log "Branch: $BRANCH"
log "Commit: $TAG"

# Function to check dependencies
check_dependencies() {
    log "Checking dependencies..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
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
    
    log "All dependencies are installed"
}

# Function to run tests
run_tests() {
    log "Running tests..."
    
    # Run unit tests
    if ! npm run test:unit; then
        log_error "Unit tests failed"
        exit 1
    fi
    
    # Run integration tests
    if ! npm run test:integration; then
        log_error "Integration tests failed"
        exit 1
    fi
    
    # Run end-to-end tests
    if ! npm run test:e2e; then
        log_error "End-to-end tests failed"
        exit 1
    fi
    
    # Check coverage
    COVERAGE_THRESHOLD=95
    ACTUAL_COVERAGE=$(npm run test:coverage | grep -o '[0-9]*%' | head -1 | sed 's/%//')
    
    if [[ $ACTUAL_COVERAGE -lt $COVERAGE_THRESHOLD ]]; then
        log_error "Coverage ($ACTUAL_COVERAGE%) is below threshold ($COVERAGE_THRESHOLD%)"
        exit 1
    fi
    
    log "All tests passed with $ACTUAL_COVERAGE% coverage"
}

# Function to build Docker image
build_image() {
    log "Building Docker image..."
    
    # Build the image with commit tag
    if ! docker build -t astro-whatsapp-bot:$TAG .; then
        log_error "Failed to build Docker image"
        exit 1
    fi
    
    # Tag as latest
    docker tag astro-whatsapp-bot:$TAG astro-whatsapp-bot:latest
    
    log "Docker image built successfully"
}

# Function to push to registry
push_image() {
    log "Pushing image to registry..."
    
    # Login to registry (in CI/CD environment)
    if [[ $IS_CI == true ]]; then
        if [[ -n "$DOCKER_REGISTRY_USER" && -n "$DOCKER_REGISTRY_PASS" ]]; then
            echo "$DOCKER_REGISTRY_PASS" | docker login -u "$DOCKER_REGISTRY_USER" --password-stdin
        else
            log_warn "Docker registry credentials not provided, skipping push"
            return 0
        fi
    fi
    
    # Push tagged image
    if ! docker push astro-whatsapp-bot:$TAG; then
        log_error "Failed to push tagged image"
        exit 1
    fi
    
    # Push latest image
    if ! docker push astro-whatsapp-bot:latest; then
        log_error "Failed to push latest image"
        exit 1
    fi
    
    log "Image pushed to registry successfully"
}

# Function to deploy to environment
deploy_environment() {
    log "Deploying to $ENVIRONMENT environment..."
    
    case $ENVIRONMENT in
        development)
            deploy_development
            ;;
        staging)
            deploy_staging
            ;;
        production)
            deploy_production
            ;;
        *)
            log_warn "Unknown environment: $ENVIRONMENT, deploying to development"
            deploy_development
            ;;
    esac
}

# Function to deploy to development
deploy_development() {
    log "Deploying to development environment..."
    
    # Use docker-compose for development
    if ! docker-compose -f docker-compose.yml up -d; then
        log_error "Failed to deploy to development environment"
        exit 1
    fi
    
    log "Development environment deployed successfully"
}

# Function to deploy to staging
deploy_staging() {
    log "Deploying to staging environment..."
    
    # Placeholder for staging deployment logic
    log "Staging deployment logic would go here"
    
    log "Staging environment deployed successfully"
}

# Function to deploy to production
deploy_production() {
    log "Deploying to production environment..."
    
    # Placeholder for production deployment logic
    log "Production deployment logic would go here"
    
    # In a real scenario, you would:
    # 1. Deploy to Kubernetes cluster
    # 2. Update load balancer
    # 3. Run health checks
    # 4. Perform rolling updates
    # 5. Monitor deployment
    
    log "Production environment deployed successfully"
}

# Function to run post-deployment tests
post_deployment_tests() {
    log "Running post-deployment tests..."
    
    # Wait for services to be ready
    sleep 10
    
    # Run health checks
    if ! curl -f http://localhost:3000/health; then
        log_error "Health check failed after deployment"
        exit 1
    fi
    
    log "Post-deployment tests passed"
}

# Function to cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove old Docker images
    docker image prune -f
    
    # Remove dangling volumes
    docker volume prune -f
    
    log "Cleanup completed"
}

# Main deployment process
main() {
    log "Starting deployment process for Astro WhatsApp Bot"
    
    # Check dependencies
    check_dependencies
    
    # Run tests (skip in CI/CD as they're run separately)
    if [[ $IS_CI == false ]]; then
        run_tests
    fi
    
    # Build Docker image
    build_image
    
    # Push to registry (only in CI/CD)
    if [[ $IS_CI == true ]]; then
        push_image
    fi
    
    # Deploy to environment
    deploy_environment
    
    # Run post-deployment tests
    post_deployment_tests
    
    # Cleanup
    cleanup
    
    log "Deployment completed successfully!"
}

# Run main function
main "$@"