# Playwright E2E Automation

End-to-end tests for the RudderStack SDET assignment using Playwright and TypeScript.

## Project Structure

```text
tests/
  auth/                      # Authentication specs
  smoke/                     # Smoke specs
  pages/                     # Page Object Model classes
  setup/
    global-setup.ts          # Pre-login + storage state
    test.ts                  # Custom fixtures
  utils/
    env.ts                   # Environment loader/validator
    paths.ts                 # Shared paths and env resolution
playwright.config.ts         # Playwright configuration
env/
  .env                       # Default environment variables (tracked)
  .env.example               # Example template
.github/workflows/
  playwright.yml             # CI workflow (push/PR/cron)
```

## Requirements

- Node.js 20+
- Playwright 1.54+

## Install

```bash
npm ci
```

## Environment Management

- The framework loads variables from `env/.env` by default.
- It supports per-environment files via the `ENV` variable:
  - `env/.env.dev`, `env/.env.qa`, `env/.env.prod`
- Resolution (in `tests/utils/paths.ts`): if `ENV` is set and `env/.env.<ENV>` exists, it is used; otherwise it falls back to `env/.env`.

Required variables (validated via Zod in `tests/utils/env.ts`):

- `BASE_URL`
- `USERNAME`
- `PASSWORD`

Example `env/.env`:

```dotenv
BASE_URL=https://app.rudderstack.com
USERNAME=you@example.com
PASSWORD=your_password
```

Example `env/.env.dev`:

```dotenv
BASE_URL=https://dev.example.com
USERNAME=dev_user@example.com
PASSWORD=dev_password
```

## Scripts

```bash
# static checks
npm run type-check
npm run lint
npm run format

# run tests
npm test                 # headless, all tests
npm run test:ui          # UI mode
npm run test:smoke       # @smoke tag only

# run by environment
npm run test:dev         # ENV=dev
npm run test:qa          # ENV=qa
npm run test:prod        # ENV=prod

# view last HTML report
npm run report
```

## Page Object Model (POM)

- Reusable page abstractions in `tests/pages/*`:
  - `BasePage`: common navigation and locators
  - `LoginPage`: login helpers (used in global setup)
  - `DashboardPage`: dashboard interactions and API calls

## Fixtures

- Custom fixtures in `tests/setup/test.ts`:

```ts
import { test, expect } from '../setup/test';
```

Provides `dashboardPage` to specs for clean reuse.

## Global Setup

- `tests/setup/global-setup.ts` logs in once and saves auth state to `storageStates/auth.json`.
- Playwright loads this state for faster, authenticated tests.

## CI/CD (GitHub Actions)

Workflow is in `.github/workflows/playwright.yml` and runs on push/PR to `main`/`master` and nightly via cron.

Supplying environment in CI (choose one):

1. Use repository Secrets as environment variables (recommended; no file needed):

```yaml
jobs:
  test:
    env:
      ENV: dev
      BASE_URL: ${{ secrets.BASE_URL_DEV }}
      USERNAME: ${{ secrets.USERNAME_DEV }}
      PASSWORD: ${{ secrets.PASSWORD_DEV }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: package-lock.json }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

2. Or create the env file from Secrets:

```yaml
jobs:
  test:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: package-lock.json }
      - name: Create env file
        run: |
          mkdir -p env
          {
            echo "BASE_URL=${{ secrets.BASE_URL_DEV }}";
            echo "USERNAME=${{ secrets.USERNAME_DEV }}";
            echo "PASSWORD=${{ secrets.PASSWORD_DEV }}";
          } > env/.env.dev
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx cross-env ENV=dev playwright test
```

Artifacts:

- HTML Report: `playwright-report/`
- Traces: `traces/`
- JUnit XML: `test-results/junit-results.xml` (uploaded if configured in CI)

## Quality & Conventions

- TypeScript strict mode, ESLint, and Prettier are configured.
- Clear naming, modular code, no dead/commented-out code in tests.

## Troubleshooting

- Timeouts on navigation: ensure `BASE_URL` is reachable and credentials are valid.
- Environment not picked up in CI: confirm repository Secrets or that `env/.env.<ENV>` is created in a prior step.
- Debug locally: `npx playwright test --headed --debug`.
