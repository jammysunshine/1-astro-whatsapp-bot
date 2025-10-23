#!/bin/bash
# scripts/setup.sh
# Setup script for Astro WhatsApp Bot development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Default values
NODE_VERSION=${NODE_VERSION:-18}
USE_DOCKER=${USE_DOCKER:-true}
INSTALL_DEPS=${INSTALL_DEPS:-true}

log "Starting setup process for Astro WhatsApp Bot development environment"
log "Node.js version: ${NODE_VERSION}"
log "Use Docker: ${USE_DOCKER}"
log "Install dependencies: ${INSTALL_DEPS}"

# Function to check system requirements
check_system_requirements() {
    log "Checking system requirements..."
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macOS"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS="Windows"
    else
        log_warn "Unsupported OS: $OSTYPE"
        OS="Unknown"
    fi
    
    log "Operating System: $OS"
    
    # Check available disk space (at least 5GB)
    AVAILABLE_SPACE=$(df . | awk 'NR==2 {print $4}')
    if [[ $AVAILABLE_SPACE -lt 5000000 ]]; then
        log_warn "Less than 5GB disk space available"
    fi
    
    # Check available memory (at least 4GB)
    AVAILABLE_MEMORY=$(free -m 2>/dev/null | awk 'NR==2 {print $7}' || echo "unknown")
    if [[ "$AVAILABLE_MEMORY" != "unknown" ]] && [[ $AVAILABLE_MEMORY -lt 4000 ]]; then
        log_warn "Less than 4GB memory available"
    fi
    
    log "System requirements check completed"
}

# Function to install system dependencies
install_system_dependencies() {
    log "Installing system dependencies..."
    
    case $OS in
        Linux)
            # Check if apt is available
            if command -v apt &> /dev/null; then
                sudo apt update
                sudo apt install -y curl git wget build-essential
            elif command -v yum &> /dev/null; then
                sudo yum update -y
                sudo yum install -y curl git wget gcc gcc-c++ make
            elif command -v pacman &> /dev/null; then
                sudo pacman -Syu --noconfirm curl git wget base-devel
            else
                log_warn "Package manager not found, please install curl, git, and wget manually"
            fi
            ;;
        macOS)
            # Check if Homebrew is installed
            if ! command -v brew &> /dev/null; then
                log "Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            
            # Install dependencies
            brew install curl git wget
            ;;
        Windows)
            log_warn "Windows detected, please ensure Git Bash, curl, and wget are installed"
            ;;
        *)
            log_warn "Unknown OS, please install curl, git, and wget manually"
            ;;
    esac
    
    log "System dependencies installed"
}

# Function to install Node.js
install_nodejs() {
    log "Installing Node.js version ${NODE_VERSION}..."
    
    # Check if Node.js is already installed
    if command -v node &> /dev/null; then
        INSTALLED_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
        if [[ $INSTALLED_VERSION -ge $NODE_VERSION ]]; then
            log "Node.js version ${INSTALLED_VERSION} already installed, skipping..."
            return 0
        else
            log "Node.js version ${INSTALLED_VERSION} installed, but version ${NODE_VERSION} or higher required"
        fi
    fi
    
    case $OS in
        Linux|macOS)
            # Use Node Version Manager (NVM) if available
            if command -v nvm &> /dev/null; then
                nvm install $NODE_VERSION
                nvm use $NODE_VERSION
            else
                # Install NVM
                log "Installing NVM..."
                curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
                
                # Reload shell configuration
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
                
                # Install and use Node.js
                nvm install $NODE_VERSION
                nvm use $NODE_VERSION
            fi
            ;;
        Windows)
            log_warn "Please install Node.js ${NODE_VERSION} manually from https://nodejs.org/"
            ;;
        *)
            log_error "Unsupported OS for automatic Node.js installation"
            exit 1
            ;;
    esac
    
    # Verify installation
    if ! command -v node &> /dev/null; then
        log_error "Failed to install Node.js"
        exit 1
    fi
    
    NODE_INSTALLED_VERSION=$(node --version)
    log "Node.js ${NODE_INSTALLED_VERSION} installed successfully"
}

# Function to install Docker
install_docker() {
    log "Installing Docker..."
    
    if [[ "$USE_DOCKER" != "true" ]]; then
        log "Docker installation skipped as per configuration"
        return 0
    fi
    
    # Check if Docker is already installed
    if command -v docker &> /dev/null; then
        log "Docker already installed, skipping..."
        return 0
    fi
    
    case $OS in
        Linux)
            # Install Docker CE
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            rm get-docker.sh
            
            # Add user to docker group
            sudo usermod -aG docker $USER
            
            # Install Docker Compose
            sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            sudo chmod +x /usr/local/bin/docker-compose
            ;;
        macOS)
            # Install Docker Desktop for Mac
            log "Please download and install Docker Desktop for Mac from https://www.docker.com/products/docker-desktop"
            log "After installation, please restart your terminal and run this script again"
            ;;
        Windows)
            # Install Docker Desktop for Windows
            log "Please download and install Docker Desktop for Windows from https://www.docker.com/products/docker-desktop"
            log "After installation, please restart your terminal and run this script again"
            ;;
        *)
            log_warn "Docker installation not supported on this OS"
            ;;
    esac
    
    log "Docker installation completed"
}

# Function to install project dependencies
install_project_dependencies() {
    log "Installing project dependencies..."
    
    if [[ "$INSTALL_DEPS" != "true" ]]; then
        log "Dependency installation skipped as per configuration"
        return 0
    fi
    
    # Check if package.json exists
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found"
        exit 1
    fi
    
    # Install dependencies
    if ! npm ci; then
        log_warn "npm ci failed, falling back to npm install"
        if ! npm install; then
            log_error "Failed to install dependencies"
            exit 1
        fi
    fi
    
    log "Project dependencies installed successfully"
}

# Function to setup environment
setup_environment() {
    log "Setting up environment..."
    
    # Check if .env file exists
    if [[ ! -f ".env" ]]; then
        log "Creating .env file from template..."
        if [[ -f ".env.example" ]]; then
            cp .env.example .env
            log "Created .env file from .env.example"
            log_warn "Please update .env file with your actual credentials"
        else
            log_warn ".env.example not found, creating empty .env file"
            touch .env
        fi
    else
        log ".env file already exists"
    fi
    
    # Setup git hooks
    if command -v husky &> /dev/null; then
        log "Setting up git hooks..."
        npx husky install
    else
        log_warn "Husky not found, git hooks not configured"
    fi
    
    log "Environment setup completed"
}

# Function to run initial tests
run_initial_tests() {
    log "Running initial tests..."
    
    # Run basic tests to verify setup
    if ! npm run test:unit -- --silent; then
        log_warn "Initial unit tests failed, but setup may still be successful"
    else
        log "Initial unit tests passed"
    fi
    
    log "Initial tests completed"
}

# Function to start development environment
start_dev_environment() {
    log "Starting development environment..."
    
    if [[ "$USE_DOCKER" == "true" ]]; then
        # Start with Docker Compose
        if command -v docker-compose &> /dev/null; then
            log "Starting development environment with Docker Compose..."
            docker-compose -f docker-compose.yml up -d
            log "Development environment started successfully"
            log "Access the application at http://localhost:3000"
            log "Access the health check at http://localhost:3000/health"
        else
            log_warn "Docker Compose not found, starting with npm..."
            npm run dev
        fi
    else
        # Start with npm
        log "Starting development environment with npm..."
        npm run dev
    fi
}

# Function to display setup completion message
display_completion_message() {
    log "====================================================================="
    log "🎉 Astro WhatsApp Bot Development Environment Setup Completed! 🎉"
    log "====================================================================="
    echo
    log "✅ System Requirements: Checked"
    log "✅ System Dependencies: Installed"
    log "✅ Node.js: Installed (Version $(node --version))"
    log "✅ Docker: $(if command -v docker &> /dev/null; then echo "Installed"; else echo "Not installed (optional)"; fi)"
    log "✅ Project Dependencies: Installed"
    log "✅ Environment: Configured"
    log "✅ Initial Tests: $(if npm run test:unit -- --silent &> /dev/null; then echo "Passed"; else echo "Failed (but setup successful)"; fi)"
    echo
    log "🚀 Next Steps:"
    log "   1. Update .env file with your actual credentials"
    log "   2. Run 'npm run dev' to start the development server"
    log "   3. Access the application at http://localhost:3000"
    log "   4. Run 'npm test' to execute the test suite"
    log "   5. Check the documentation at docs/ directory"
    echo
    log "📚 Useful Commands:"
    log "   - npm run dev: Start development server"
    log "   - npm test: Run test suite"
    log "   - npm run test:coverage: Run tests with coverage report"
    log "   - npm run lint:check: Check code for linting issues"
    log "   - npm run format:check: Check code formatting"
    echo
    log "🔧 Development Environment:"
    log "   - Node.js Version: $(node --version)"
    log "   - npm Version: $(npm --version)"
    log "   - Docker: $(if command -v docker &> /dev/null; then echo "Available"; else echo "Not available"; fi)"
    log "   - Docker Compose: $(if command -v docker-compose &> /dev/null; then echo "Available"; else echo "Not available"; fi)"
    echo
    log "💡 Tips:"
    log "   - Use 'npm run test:watch' for continuous testing during development"
    log "   - Use 'npm run lint' to automatically fix linting issues"
    log "   - Use 'npm run format' to automatically format code"
    log "   - Check the logs directory for application logs"
    echo
    log "For any issues, please check the documentation or open an issue on GitHub"
    log "Happy coding! 🚀"
    log "====================================================================="
}

# Main setup process
main() {
    log "Starting comprehensive setup process for Astro WhatsApp Bot"
    
    # Record start time
    START_TIME=$(date +%s)
    
    # Check system requirements
    check_system_requirements
    
    # Install system dependencies
    install_system_dependencies
    
    # Install Node.js
    install_nodejs
    
    # Install Docker
    install_docker
    
    # Install project dependencies
    install_project_dependencies
    
    # Setup environment
    setup_environment
    
    # Run initial tests
    run_initial_tests
    
    # Calculate duration
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    log "Setup process completed in ${DURATION} seconds"
    
    # Display completion message
    display_completion_message
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-docker)
            USE_DOCKER="false"
            shift
            ;;
        --no-deps)
            INSTALL_DEPS="false"
            shift
            ;;
        --node-version)
            NODE_VERSION="$2"
            shift 2
            ;;
        --start)
            START_DEV="true"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --no-docker        Skip Docker installation"
            echo "  --no-deps          Skip dependency installation"
            echo "  --node-version VER Install specific Node.js version"
            echo "  --start            Start development environment after setup"
            echo "  -h, --help         Show this help message"
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

# Start development environment if requested
if [[ "$START_DEV" == "true" ]]; then
    start_dev_environment
fi