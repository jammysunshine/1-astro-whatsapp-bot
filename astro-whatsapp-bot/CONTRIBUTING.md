# Contributing Guidelines

We welcome contributions to the Astro WhatsApp Bot project! To ensure a smooth and collaborative development process, please adhere to the following guidelines.

## Git Configuration

Your Git client should be configured to track only source code, explicitly excluding:
- `node_modules/` - Dependencies folder
- `.next/` - Next.js build artifacts (if applicable)
- `out/` - Next.js static export folder (if applicable)
- `build/` - General build artifacts
- `npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*`, `.pnpm-debug.log*` - Debug logs
- `.env*` - Environment files (except .env.example if needed as template)
- `.vercel` - Vercel deployment files
- `.DS_Store` - macOS system files
- `*.pem` - Certificate files
- `*.key` - Key files
- `*.cert` - Certificate files
- `*.json` - Sensitive JSON files (credentials, etc.)
- `coverage/` - Test coverage reports
- `.pnp`, `.pnp.*`, `.yarn/*` - Package manager specific files
- `.aider*` - Aider tool files
- `logs/` - Log files directory
- `temp/` - Temporary files directory
- `.bmad-core/` - BMAD package files and related content
- Any other build artifacts, temporary files, or binary files.

These exclusions are managed via the `.gitignore` file in the project root.

## Commit Message Guidelines

Commit messages should be simple, concise, and descriptive. Avoid using special characters (e.g., `!`, `@`, `#`, `%`, `^`, `&`, `*`, `(`, `)`, `[`, `]`, `{`, `}`, `;`, `:`, `'`, `\"`, `<`, `>`, `?`, `/`, `\\`, `|`, `~`, `` ` ``, `-`, `_`, `=`, `+`) in the commit message itself to ensure compatibility and readability across various Git tools and platforms.

We follow a conventional commit format:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- `ci`: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

Example:
```
feat: Add user authentication via WhatsApp

This commit introduces user authentication using WhatsApp number verification.
It includes OTP generation and secure profile creation.
```

## Branch Management Guidelines

We utilize a **Feature Branch Workflow** for all significant work. Please adhere to the following:

- **Feature Branch Workflow**: Use dedicated feature branches (e.g., `feature/feature-name`, `bugfix/issue-description`) for all significant work to isolate changes and prevent disruption to the main branch.
- **Branch Naming Convention**: Follow consistent naming patterns (e.g., `feature/`, `bugfix/`, `hotfix/`, `release/`).
- **Automated Cleanup**: Feature branches should be deleted after a successful merge to keep the repository clean.
- **Incremental Development**: Break large improvements into smaller, testable changes that can be developed and validated incrementally.
- **Branch Management**: Create new branches for optimization work and other significant changes rather than committing directly to `main`.

## Code Quality Standards

- **Linting**: Implement and enforce consistent code linting (e.g., ESLint, Prettier) across all projects.
- **Code Reviews**: All code changes must pass peer review before merging.
- **Technical Debt Management**: Address technical debt items identified during development in subsequent sprints.
- **Refactoring Standards**: Refactor code when code coverage thresholds are met to maintain quality.

## Automated Testing Mandates

- **Zero Manual Testing**: ALL testing must be fully automated with no exceptions.
- **Minimum Coverage**: Maintain at least 95% test coverage across all projects.
- **Comprehensive Test Types**: Implement unit tests, integration tests, end-to-end tests, regression tests, smoke tests, and mocking frameworks for ALL features.
- **Continuous Testing**: Run automated tests on every commit and pull request via CI/CD pipeline.
- **Test-Driven Development**: Write tests first before implementing features.

## Security Practices

- **Dependency Scanning**: Run automated security scans regularly and address vulnerabilities.
- **Secret Management**: Never commit secrets to the repository; use environment variables, vaults, or secure storage.
- **Input Validation**: Implement comprehensive input validation and sanitization.
- **Authentication & Authorization**: Implement proper authentication and authorization.
- **Webhook Validation**: Always validate incoming webhook requests.
- **Rate Limiting**: Implement rate limiting for all public endpoints.
- **CORS Configuration**: Configure Cross-Origin Resource Sharing (CORS) policies appropriately.
- **Data Encryption**: Encrypt sensitive data in transit and at rest.
- **Principle of Least Privilege**: Assign minimal required permissions.
- **Security Headers**: Implement security headers.
- **File Upload Validation**: Validate file types, sizes, and scan for malicious content.
- **API Key Management**: Regularly rotate API keys.

## Documentation Standards

- **API Documentation**: Maintain up-to-date API documentation for all endpoints.
- **Inline Documentation**: Include meaningful comments and documentation for complex logic.
- **Architecture Documentation**: Keep architectural decision records (ADRs) up to date.
- **README Updates**: Update README files with any significant feature additions or changes.
- **Code Documentation**: Use consistent documentation formats.

## Collaboration & Communication

- **Pull Request Standards**: Follow consistent pull request templates and review processes.
- **Commit Standards**: Follow conventional commit message formats.
- **Issue Tracking**: Maintain clear issue tracking and project management.
- **Knowledge Sharing**: Document architectural decisions and share knowledge regularly.
