#!/usr/bin/env node

/**
 * Notification System Test Runner
 * Comprehensive test execution with setup, cleanup, and reporting
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  testFiles: [
    'src/components/notifications/__tests__/NotificationSystem.integration.test.tsx',
    'src/components/notifications/__tests__/NotificationDatabase.integration.test.tsx',
    'src/components/notifications/__tests__/NotificationBell.test.tsx',
  ],
  cleanupScript: 'src/test/scripts/cleanupNotificationTests.ts',
  coverageThreshold: {
    lines: 85,
    functions: 85,
    branches: 80,
    statements: 85,
  },
  timeout: 30000, // 30 seconds per test
  retries: 2,
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

// Check if required files exist
function validateTestEnvironment() {
  logStep(1, 'Validating test environment...');

  const requiredFiles = [
    'package.json',
    'vitest.config.ts',
    'src/test/setup.ts',
    ...CONFIG.testFiles,
  ];

  const missingFiles = requiredFiles.filter((file) => !fs.existsSync(file));

  if (missingFiles.length > 0) {
    logError(`Missing required files: ${missingFiles.join(', ')}`);
    process.exit(1);
  }

  // Check environment variables
  const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    logWarning(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    log('Tests will use mock values from vitest.config.ts');
  }

  logSuccess('Test environment validation passed');
}

// Run pre-test cleanup
async function preTestCleanup() {
  logStep(2, 'Running pre-test cleanup...');

  try {
    // Run cleanup script if it exists
    if (fs.existsSync(CONFIG.cleanupScript)) {
      execSync(`npx tsx ${CONFIG.cleanupScript}`, {
        stdio: 'pipe',
        timeout: 10000,
      });
      logSuccess('Pre-test cleanup completed');
    } else {
      logWarning('Cleanup script not found, skipping pre-test cleanup');
    }
  } catch (error) {
    logWarning(`Pre-test cleanup failed: ${error.message}`);
    log('Continuing with tests...');
  }
}

// Run individual test file
function runTestFile(testFile, options = {}) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';

    const args = [
      'run',
      'test',
      testFile,
      '--reporter=verbose',
      `--testTimeout=${CONFIG.timeout}`,
      options.coverage ? '--coverage' : '',
      options.watch ? '--watch' : '',
      options.ui ? '--ui' : '',
    ].filter(Boolean);

    log(`\nRunning: ${npmCmd} ${args.join(' ')}`, 'blue');

    const testProcess = spawn(npmCmd, args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        VITE_SUPABASE_URL:
          process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
        VITE_SUPABASE_ANON_KEY:
          process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key',
      },
      shell: isWindows,
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, file: testFile });
      } else {
        resolve({ success: false, file: testFile, code });
      }
    });

    testProcess.on('error', (error) => {
      reject({ success: false, file: testFile, error: error.message });
    });
  });
}

// Run all notification tests
async function runNotificationTests(options = {}) {
  logStep(3, 'Running notification system tests...');

  const results = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const testFile of CONFIG.testFiles) {
    log(`\n${'─'.repeat(40)}`, 'cyan');
    log(`Testing: ${testFile}`, 'bright');
    log('─'.repeat(40), 'cyan');

    try {
      const result = await runTestFile(testFile, options);
      results.push(result);

      if (result.success) {
        logSuccess(`${testFile} - PASSED`);
        passedTests++;
      } else {
        logError(`${testFile} - FAILED (exit code: ${result.code})`);
        failedTests++;
      }
      totalTests++;
    } catch (error) {
      logError(`${testFile} - ERROR: ${error.error || error.message}`);
      results.push({
        success: false,
        file: testFile,
        error: error.error || error.message,
      });
      failedTests++;
      totalTests++;
    }
  }

  return { results, totalTests, passedTests, failedTests };
}

// Run coverage analysis
async function runCoverageAnalysis() {
  logStep(4, 'Running coverage analysis...');

  try {
    // Run coverage on notification test files specifically
    const testPattern = CONFIG.testFiles.join(' ');
    const coverageArgs = ['run', 'test:coverage', testPattern];

    execSync(`npm ${coverageArgs.join(' ')}`, {
      stdio: 'inherit',
      timeout: 60000,
    });

    logSuccess('Coverage analysis completed');

    // Check if coverage meets thresholds
    if (fs.existsSync('coverage/coverage-summary.json')) {
      const coverageSummary = JSON.parse(
        fs.readFileSync('coverage/coverage-summary.json', 'utf8')
      );
      const total = coverageSummary.total;

      log('\nCoverage Summary:', 'bright');
      log(
        `Lines: ${total.lines.pct}% (threshold: ${CONFIG.coverageThreshold.lines}%)`
      );
      log(
        `Functions: ${total.functions.pct}% (threshold: ${CONFIG.coverageThreshold.functions}%)`
      );
      log(
        `Branches: ${total.branches.pct}% (threshold: ${CONFIG.coverageThreshold.branches}%)`
      );
      log(
        `Statements: ${total.statements.pct}% (threshold: ${CONFIG.coverageThreshold.statements}%)`
      );

      const meetsThreshold =
        total.lines.pct >= CONFIG.coverageThreshold.lines &&
        total.functions.pct >= CONFIG.coverageThreshold.functions &&
        total.branches.pct >= CONFIG.coverageThreshold.branches &&
        total.statements.pct >= CONFIG.coverageThreshold.statements;

      if (meetsThreshold) {
        logSuccess('Coverage thresholds met');
      } else {
        logWarning('Some coverage thresholds not met');
      }

      return meetsThreshold;
    }
  } catch (error) {
    logError(`Coverage analysis failed: ${error.message}`);
    return false;
  }
}

// Run post-test cleanup
async function postTestCleanup() {
  logStep(5, 'Running post-test cleanup...');

  try {
    if (fs.existsSync(CONFIG.cleanupScript)) {
      execSync(`npx tsx ${CONFIG.cleanupScript}`, {
        stdio: 'pipe',
        timeout: 10000,
      });
      logSuccess('Post-test cleanup completed');
    } else {
      logWarning('Cleanup script not found, skipping post-test cleanup');
    }
  } catch (error) {
    logWarning(`Post-test cleanup failed: ${error.message}`);
  }
}

// Generate test report
function generateTestReport(testResults, coverageMet) {
  logSection('TEST REPORT');

  const { totalTests, passedTests, failedTests } = testResults;

  log(`Total Test Files: ${totalTests}`, 'bright');
  log(
    `Passed: ${passedTests}`,
    passedTests === totalTests ? 'green' : 'yellow'
  );
  log(`Failed: ${failedTests}`, failedTests === 0 ? 'green' : 'red');
  log(
    `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`,
    passedTests === totalTests ? 'green' : 'yellow'
  );

  if (failedTests > 0) {
    log('\nFailed Tests:', 'red');
    testResults.results
      .filter((result) => !result.success)
      .forEach((result) => {
        log(`  - ${result.file}`, 'red');
        if (result.error) {
          log(`    Error: ${result.error}`, 'red');
        }
      });
  }

  log(
    `\nCoverage Thresholds: ${coverageMet ? 'MET' : 'NOT MET'}`,
    coverageMet ? 'green' : 'yellow'
  );

  const overallSuccess = passedTests === totalTests && coverageMet;
  log(
    `\nOverall Result: ${overallSuccess ? 'SUCCESS' : 'NEEDS ATTENTION'}`,
    overallSuccess ? 'green' : 'yellow'
  );

  return overallSuccess;
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const options = {
    coverage: args.includes('--coverage'),
    watch: args.includes('--watch'),
    ui: args.includes('--ui'),
    skipCleanup: args.includes('--skip-cleanup'),
  };

  logSection('CIVIC PORTAL NOTIFICATION SYSTEM TEST SUITE');

  try {
    // Step 1: Validate environment
    validateTestEnvironment();

    // Step 2: Pre-test cleanup
    if (!options.skipCleanup) {
      await preTestCleanup();
    }

    // Step 3: Run tests
    const testResults = await runNotificationTests(options);

    // Step 4: Coverage analysis (if not in watch mode)
    let coverageMet = true;
    if (!options.watch && !options.ui) {
      coverageMet = await runCoverageAnalysis();
    }

    // Step 5: Post-test cleanup
    if (!options.skipCleanup && !options.watch) {
      await postTestCleanup();
    }

    // Generate report
    const overallSuccess = generateTestReport(testResults, coverageMet);

    // Exit with appropriate code
    process.exit(overallSuccess ? 0 : 1);
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle script execution - run main function directly
main().catch((error) => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});

export { runNotificationTests, validateTestEnvironment, generateTestReport };
