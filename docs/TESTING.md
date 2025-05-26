# Testing Guide - Civic Portal

This guide provides comprehensive information about testing the Civic Portal application, including test strategies, setup, and best practices.

## Table of Contents

- [Testing Overview](#testing-overview)
- [Test Environment Setup](#test-environment-setup)
- [End-to-End Testing with Cypress](#end-to-end-testing-with-cypress)
- [Test Categories](#test-categories)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Test Data Management](#test-data-management)
- [Continuous Integration](#continuous-integration)
- [Best Practices](#best-practices)

## Testing Overview

The Civic Portal uses a comprehensive testing strategy focused on end-to-end (E2E) testing with Cypress to ensure all user flows work correctly across different scenarios and user roles.

### Testing Philosophy

- **User-Centric**: Tests simulate real user interactions and workflows
- **Role-Based**: Tests cover different user roles (citizens, officials, admins)
- **Feature-Complete**: All major features are tested comprehensively
- **Cross-Browser**: Tests run across different browsers and devices
- **Continuous**: Tests run automatically on code changes

### Test Types

1. **End-to-End Tests**: Complete user workflows using Cypress
2. **Integration Tests**: Component interactions and API integrations
3. **Visual Tests**: UI consistency and responsive design
4. **Accessibility Tests**: WCAG compliance and screen reader compatibility

## Test Environment Setup

### Prerequisites

- Node.js v18 or higher
- Civic Portal application running locally
- Test database (separate from development)
- Cypress installed and configured

### Installation

```bash
# Install Cypress (already included in package.json)
npm install

# Verify Cypress installation
npx cypress verify
```

### Configuration

Cypress configuration is defined in `cypress.config.ts`:

```typescript
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
  },
});
```

### Environment Variables

Create a `cypress.env.json` file for test-specific configuration:

```json
{
  "TEST_USER_EMAIL": "test@example.com",
  "TEST_USER_PASSWORD": "testpassword123",
  "TEST_ADMIN_EMAIL": "admin@example.com",
  "TEST_ADMIN_PASSWORD": "adminpassword123"
}
```

## End-to-End Testing with Cypress

### Test Structure

Tests are organized in the `cypress/e2e/` directory:

```
cypress/
├── e2e/
│   ├── auth.cy.ts              # Authentication tests
│   ├── home.cy.ts              # Home page tests
│   ├── issues.cy.ts            # Issue management tests
│   ├── issue-interactions.cy.ts # User interactions
│   ├── profile.cy.ts           # Profile management tests
│   ├── reports.cy.ts           # Reports and analytics
│   ├── realtime-reports.cy.ts  # Real-time features
│   └── integration-flows.cy.ts # End-to-end workflows
├── support/
│   ├── commands.ts             # Custom commands
│   └── e2e.ts                  # Global configuration
└── fixtures/                   # Test data files
```

### Custom Commands

Custom Cypress commands are defined in `cypress/support/commands.ts`:

```typescript
// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/');
  cy.get('[data-cy=auth-button]').click();
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
});

// Create issue command
Cypress.Commands.add('createIssue', (title: string, description: string) => {
  cy.get('[data-cy=create-issue-button]').click();
  cy.get('[data-cy=issue-title-input]').type(title);
  cy.get('[data-cy=issue-description-input]').type(description);
  cy.get('[data-cy=submit-issue-button]').click();
});
```

## Test Categories

### Authentication Tests (`auth.cy.ts`)

Tests user authentication flows:

- User registration with different roles
- Login and logout functionality
- Password reset workflow
- Role-based access control
- Verification workflow for officials

### Issue Management Tests (`issues.cy.ts`)

Tests core issue functionality:

- Issue creation and editing
- Issue filtering and searching
- Status updates and workflow
- Comment system
- Voting and watching

### User Interaction Tests (`issue-interactions.cy.ts`)

Tests user engagement features:

- Commenting on issues
- Voting and supporting issues
- Watching issues for updates
- Proposing solutions
- Notification system

### Profile Tests (`profile.cy.ts`)

Tests user profile management:

- Profile editing and updates
- Dashboard functionality
- Activity tracking
- Settings management
- Privacy controls

### Reports Tests (`reports.cy.ts`, `realtime-reports.cy.ts`)

Tests analytics and reporting:

- Dashboard data visualization
- Real-time data updates
- Chart interactions
- Filtering and date ranges
- Export functionality

### Integration Tests (`integration-flows.cy.ts`)

Tests complete user journeys:

- Citizen reporting an issue
- Official responding to issues
- Admin managing users
- Cross-role interactions
- End-to-end workflows

### Home Page Tests (`home.cy.ts`)

Tests landing page functionality:

- Navigation and routing
- Demo mode access
- Information display
- Call-to-action buttons
- Responsive design

## Writing Tests

### Test Structure

Follow this structure for writing tests:

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    cy.visit('/');
  });

  it('should perform specific action', () => {
    // Arrange
    cy.login('user@example.com', 'password');
    
    // Act
    cy.get('[data-cy=action-button]').click();
    
    // Assert
    cy.get('[data-cy=success-message]').should('be.visible');
  });
});
```

### Data Attributes

Use `data-cy` attributes for reliable element selection:

```tsx
// Good
<button data-cy="submit-button">Submit</button>

// Avoid
<button className="btn-primary">Submit</button>
```

### Assertions

Use descriptive assertions:

```typescript
// Good
cy.get('[data-cy=issue-title]').should('contain.text', 'Expected Title');
cy.get('[data-cy=status-badge]').should('have.class', 'status-open');

// More specific
cy.get('[data-cy=issue-list]').should('have.length.greaterThan', 0);
```

### Waiting and Timing

Handle asynchronous operations properly:

```typescript
// Wait for API calls
cy.intercept('GET', '/api/issues').as('getIssues');
cy.visit('/issues');
cy.wait('@getIssues');

// Wait for elements
cy.get('[data-cy=loading-spinner]').should('not.exist');
cy.get('[data-cy=issue-list]').should('be.visible');
```

## Running Tests

### Local Development

```bash
# Open Cypress Test Runner (interactive)
npm run cypress:open

# Run all tests headlessly
npm run test:e2e

# Run specific test file
npx cypress run --spec "cypress/e2e/auth.cy.ts"

# Run tests in specific browser
npx cypress run --browser chrome
```

### Test Scripts

Available npm scripts:

```json
{
  "cypress:open": "cypress open",
  "cypress:run": "cypress run",
  "test:e2e": "start-server-and-test dev http://localhost:5173 cypress:run",
  "test:e2e:ci": "start-server-and-test dev http://localhost:5173 'cypress run --headless'"
}
```

### Debugging Tests

1. **Interactive Mode**: Use `cypress:open` for debugging
2. **Screenshots**: Automatically captured on test failures
3. **Console Logs**: Use `cy.log()` for debugging information
4. **Pause Execution**: Use `cy.pause()` to pause test execution

## Test Data Management

### Test Database

Use a separate test database:

1. Create a test Supabase project
2. Apply the same migrations
3. Use test-specific environment variables
4. Clean up data between test runs

### Fixtures

Store test data in `cypress/fixtures/`:

```typescript
// cypress/fixtures/issues.json
{
  "sampleIssue": {
    "title": "Test Issue",
    "description": "This is a test issue",
    "category": "infrastructure"
  }
}

// Using in tests
cy.fixture('issues').then((issues) => {
  cy.createIssue(issues.sampleIssue.title, issues.sampleIssue.description);
});
```

### Data Cleanup

Implement proper cleanup strategies:

```typescript
beforeEach(() => {
  // Clean up test data
  cy.task('cleanDatabase');
});

afterEach(() => {
  // Reset application state
  cy.clearLocalStorage();
  cy.clearCookies();
});
```

## Continuous Integration

### GitHub Actions

Example workflow for CI testing:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Cypress tests
        run: npm run test:e2e:ci
        env:
          VITE_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
```

### Test Reporting

Generate test reports for CI:

```bash
# Generate JUnit report
npx cypress run --reporter junit --reporter-options mochaFile=results/test-results.xml

# Generate HTML report
npx cypress run --reporter mochawesome --reporter-options reportDir=results,overwrite=false,html=false,json=true
```

## Best Practices

### Test Design

1. **Independent Tests**: Each test should be able to run independently
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: Each test should focus on one specific behavior
4. **Realistic Data**: Use realistic test data that reflects actual usage

### Performance

1. **Minimize Setup**: Reduce unnecessary setup in tests
2. **Parallel Execution**: Run tests in parallel when possible
3. **Smart Waiting**: Use proper waiting strategies instead of fixed delays
4. **Resource Cleanup**: Clean up resources after tests

### Maintenance

1. **Page Objects**: Use page object pattern for complex pages
2. **Reusable Commands**: Create custom commands for common actions
3. **Regular Updates**: Keep tests updated with application changes
4. **Documentation**: Document complex test scenarios

### Debugging

1. **Meaningful Assertions**: Use descriptive assertion messages
2. **Step-by-Step**: Break complex tests into smaller steps
3. **Visual Debugging**: Use screenshots and videos for debugging
4. **Error Handling**: Handle expected errors gracefully

---

This testing guide ensures comprehensive coverage of the Civic Portal's functionality and maintains high quality standards through automated testing.
