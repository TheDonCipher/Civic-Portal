# Contributing to Government Issue Tracking Portal

Thank you for your interest in contributing to the Government Issue Tracking Portal! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read and understand it before contributing.

In short, we expect all contributors to:

- Be respectful and inclusive
- Be collaborative
- Be clear and constructive when providing feedback
- Focus on what is best for the community and the project

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm, yarn, or pnpm
- Git
- A Supabase account (free tier available)

### Setting Up the Development Environment

1. Fork the repository

2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/government-issue-tracker.git
   cd government-issue-tracker
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required Supabase credentials

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

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
   npm run test
   npm run test:e2e
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

### Unit and Integration Tests

- Write tests for all new features and bug fixes
- Aim for high test coverage, especially for critical functionality
- Use React Testing Library for component tests
- Place tests in `__tests__` directories or alongside the code they test with a `.test.tsx` extension

### End-to-End Tests

- Use Cypress for end-to-end tests
- Focus on critical user flows
- Place E2E tests in the `cypress/e2e` directory
- Follow the existing pattern for test organization

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

---

Thank you for contributing to the Government Issue Tracking Portal! Your efforts help improve civic engagement and government transparency.
