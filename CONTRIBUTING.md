# Contributing to Civic Portal

Thank you for your interest in contributing to the Civic Portal! This document provides comprehensive guidelines and instructions for contributing to this Botswana government civic engagement platform.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Security](#security)
- [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read and understand it before contributing.

In short, we expect all contributors to:

- Be respectful and inclusive
- Be collaborative
- Be clear and constructive when providing feedback
- Focus on what is best for the community and the project

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher (recommended: v18.17.0+)
- **Package Manager**: npm (included with Node.js), yarn, or pnpm
- **Git**: For version control
- **Supabase Account**: Free tier available at [supabase.com](https://supabase.com)
- **Code Editor**: VS Code recommended with TypeScript and Tailwind CSS extensions

### Setting Up the Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:

   ```bash
   git clone https://github.com/your-username/civic-portal.git
   cd civic-portal
   ```

3. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

4. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Set up the database**:

   ```bash
   # Using Supabase CLI (recommended)
   npx supabase db push

   # Or manually run migrations in Supabase SQL Editor
   ```

6. **Start the development server**:

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

7. **Verify setup**:
   - Check that the application loads without errors
   - Test demo mode functionality
   - Verify database connection in browser console

## Development Workflow

1. Create a new branch for your feature or bugfix:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-you-are-fixing
   ```

2. Make your changes, following the [coding standards](#coding-standards)

3. Write or update tests as necessary

4. Run tests to ensure your changes don't break existing functionality:

   ```bash
   # Run unit tests
   npm run test

   # Run end-to-end tests (Playwright)
   npm run test:e2e

   # Run Cypress tests interactively
   npm run cypress:open

   # Run all tests
   npm run test && npm run test:e2e && npm run cypress:run
   ```

5. Commit your changes with a descriptive commit message:

   ```bash
   git commit -m "Add feature: your feature description"
   ```

6. Push your branch to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

7. Create a pull request from your fork to the main repository

## Pull Request Process

1. Ensure your PR addresses a specific issue or feature
2. Update the README.md or documentation as necessary
3. Include screenshots or GIFs for UI changes
4. Make sure all tests pass
5. Request a review from maintainers
6. Address any feedback from reviewers

Pull requests will be merged once they have been approved by at least one maintainer.

## Coding Standards

### General Guidelines

- Use TypeScript for all new code
- Follow the existing code style and organization
- Keep components small and focused on a single responsibility
- Use meaningful variable and function names
- Add comments for complex logic

### React Best Practices

- Use functional components with hooks
- Avoid unnecessary re-renders
- Keep state as local as possible
- Use proper prop types or TypeScript interfaces
- Extract reusable logic into custom hooks

### Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Ensure components are responsive
- Use the shadcn/ui components when appropriate

## Testing Guidelines

The Civic Portal uses multiple testing frameworks to ensure comprehensive coverage and reliability across all features and user scenarios.

### Testing Strategy

- **Unit Tests (Vitest)**: Test individual functions and components in isolation
- **Integration Tests (Vitest)**: Test component interactions and API integrations
- **End-to-End Tests (Cypress)**: Test complete user workflows and critical paths
- **Cross-Browser Tests (Playwright)**: Ensure compatibility across different browsers

### Unit and Integration Tests (Vitest)

- **Write unit tests** for utility functions, hooks, and complex logic
- **Test components** with React Testing Library for user interaction testing
- **Mock external dependencies** to isolate units under test
- **Place tests** alongside source files with `.test.ts` or `.spec.ts` extensions
- **Aim for high coverage** of critical business logic

### End-to-End Tests (Cypress)

- **Write tests for all new features** and bug fixes
- **Focus on critical user flows** including authentication, issue management, and role-based access
- **Place E2E tests** in the `cypress/e2e` directory
- **Follow existing patterns** for test organization and naming conventions

### Cross-Browser Tests (Playwright)

- **Test critical flows** across Chrome, Firefox, and Safari
- **Focus on browser-specific issues** and compatibility
- **Place tests** in the `e2e` directory
- **Use Playwright's built-in assertions** and utilities

### Test Categories

#### Authentication Tests

- User registration and login flows
- Role-based access control
- Password reset functionality
- Verification workflow testing

#### Feature Tests

- Issue creation, editing, and management
- Commenting and voting systems
- Solution proposals and selection
- Real-time updates and notifications

#### User Experience Tests

- Navigation and routing
- Demo mode functionality
- Responsive design across devices
- Accessibility compliance

### Running Tests

```bash
# Unit and Integration Tests
npm run test                    # Run unit tests
npm run test:ui                 # Run tests with UI
npm run test:watch              # Run tests in watch mode
npm run test:coverage           # Generate coverage report

# End-to-End Tests (Cypress)
npm run cypress:open            # Open Cypress test runner (interactive)
npm run cypress:run             # Run Cypress tests headlessly
npm run test:e2e:ci             # Run tests with server startup

# Cross-Browser Tests (Playwright)
npm run test:e2e                # Run Playwright tests
npm run test:e2e:ui             # Run with UI mode
npm run test:e2e:headed         # Run in headed mode
npm run test:e2e:debug          # Debug tests

# Run All Tests
npm run test && npm run test:e2e && npm run cypress:run
```

### Writing Tests

- Use descriptive test names that explain the user scenario
- Include proper setup and teardown for test isolation
- Test both positive and negative scenarios
- Verify visual elements and user feedback
- Test across different user roles when applicable

### Test Data

- Use realistic test data that reflects actual use cases
- Clean up test data after test completion
- Avoid dependencies between tests
- Use demo mode for testing when appropriate

## Documentation

- Update the README.md file for significant changes
- Document new features, components, or APIs
- Include JSDoc comments for functions and components
- Update the CHANGELOG.md for notable changes

## Issue Reporting

If you find a bug or have a feature request:

1. Check if the issue already exists in the GitHub issues
2. If not, create a new issue using the appropriate template
3. Provide as much detail as possible, including:
   - Steps to reproduce (for bugs)
   - Expected behavior
   - Actual behavior
   - Screenshots or GIFs if applicable
   - Environment information (browser, OS, etc.)

## Feature Requests

When suggesting new features:

1. Clearly describe the problem the feature would solve
2. Explain how the feature would benefit users
3. Provide examples or mockups if possible
4. Be open to discussion and feedback

## Security

Security is paramount for a civic engagement platform. When contributing:

### Reporting Security Issues

- **Do not** create public GitHub issues for security vulnerabilities
- Email security concerns to [security@civic-portal.com] (replace with actual email)
- Include detailed information about the vulnerability
- Allow time for the security team to address the issue before public disclosure

### Security Best Practices

- Follow secure coding practices
- Validate all user inputs
- Use parameterized queries for database operations
- Implement proper authentication and authorization checks
- Keep dependencies updated and scan for vulnerabilities
- Follow the principle of least privilege

### Data Protection

- Respect user privacy and data protection laws
- Implement proper data encryption for sensitive information
- Follow GDPR and other applicable privacy regulations
- Ensure proper data retention and deletion policies

## Community

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and community discussions
- **Pull Requests**: For code contributions and reviews

### Getting Help

- Check existing documentation in the `/docs` directory
- Search through existing GitHub issues and discussions
- Ask questions in GitHub Discussions
- Join community calls (if applicable)

### Recognition

Contributors are recognized in several ways:

- Listed in the project's contributors section
- Mentioned in release notes for significant contributions
- Invited to join the core contributor team for ongoing contributors

---

**Thank you for contributing to the Civic Portal!**

Your efforts help improve civic engagement and government transparency in Botswana. Together, we're building a platform that empowers citizens and facilitates better communication between the public and government officials.

_Every contribution, no matter how small, makes a difference in strengthening democracy and civic participation._
