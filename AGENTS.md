# AGENTS.md (Cypress)

This repository uses **Cypress (E2E)**. This document defines conventions for agents (and humans) when adding/editing tests.

## Goals

- Keep tests **deterministic**, **readable**, and **easy to debug**.
- Keep **secrets** (credentials) out of the codebase.
- Prefer stable selectors and reusable flows.

## Quick start

- Install dependencies:
  - `npm ci` (or `npm install` if there is no lockfile)
- Run Cypress:
  - `npx cypress open`
  - `npx cypress run`

## Environment variables (Cloudassistant)

Credentials **must not** live in the repository. Use a local `.env` (git-ignored) based on `.env.example`.

- **Required**:
  - `CLOUDASSISTANT_URL`
  - `CLOUDASSISTANT_USER`
  - `CLOUDASSISTANT_PASSWORD`

### How to consume them in Cypress (recommended pattern)

Per Cypress documentation, the common approach is to map OS environment variables into `config.env` in `cypress.config.js`, then read them in tests using `cy.env()`.

- **In `cypress.config.js`**: map `process.env.CLOUDASSISTANT_*` into `config.env`.
- **In tests/commands**: read with `cy.env('cloudassistantUrl')`, `cy.env('cloudassistantUser')`, etc.

Rules:

- Do not log secrets to the console or snapshots.
- If a required variable is missing, fail fast with a clear message.

## Suggested structure

- `cypress/e2e/**`: E2E specs
- `cypress/support/commands.js`: reusable commands (`cy.login()`, etc.)
- `cypress/fixtures/**`: non-sensitive static data

## Selectors and best practices

- Prefer `data-*` (e.g. `data-cy="login-email"`) over brittle selectors (classes/deep DOM).
- Avoid `cy.wait(XXXX)` unless justified; prefer state-based waits (`should`, `contains`, `intercept` + alias `wait`).
- Keep tests **independent**: each spec prepares its own state.

## Getting page context with Chrome DevTools

When you need reliable selectors or you are debugging a failing test, use **Chrome DevTools** to capture the current page context before changing tests:

- **Page snapshot (A11y tree)**: capture a snapshot to get a structured view of elements and their accessible names/roles (useful to craft stable `cy.findByRole`-style selectors or improve `cy.contains()` targets).
- **Console**: check for errors/warnings that explain missing elements or blocked resources.
- **Network**: verify login requests, redirects, and API responses; prefer waiting on `cy.intercept()` aliases instead of arbitrary `cy.wait()`.
- **Elements panel**: confirm the app has stable `data-*` hooks; if not, propose adding `data-cy`/`data-testid` attributes in the app.

## Authentication (Cloudassistant)

When implementing `cy.login()`:

- Centralize the flow in `cypress/support/commands.js`.
- Avoid repeating the same login in every test if you can cache state (when applicable) without breaking isolation.
- Use `cy.session()` if it improves performance while keeping stability.

## CI / headless execution

- Prefer injecting secrets via CI runner environment variables instead of files.
- Never commit `cypress.env.json` with secrets.

## Cursor Cloud specific instructions

### Service overview

This repo is a **Cypress E2E test suite only** — there is no application to build or start. The system under test is **Cloudassistant**, an external web app accessed via `CLOUDASSISTANT_URL`.

### Required secrets (injected as environment variables)

| Variable | Purpose |
|---|---|
| `CLOUDASSISTANT_URL` | Base URL of the Cloudassistant instance |
| `CLOUDASSISTANT_USER` | Login username |
| `CLOUDASSISTANT_PASSWORD` | Login password |

All three must be present before running tests.

### Running tests

- **Headless:** `npx cypress run --browser electron --config "baseUrl=$CLOUDASSISTANT_URL"`
- **Interactive (headed):** `npx cypress open` (requires a display / Xvfb)
- Pass credentials to specs via `setupNodeEvents` in `cypress.config.js` (see AGENTS.md § "How to consume them in Cypress").

### Key gotcha: `allowCypressEnv: false`

`cypress.config.js` sets `allowCypressEnv: false` (Cypress 15 default). This means:
- The `--env` CLI flag and `Cypress.env()` are **disabled**.
- Use `cy.env()` instead, and wire values through `config.env` inside `setupNodeEvents`.
- For `baseUrl`, pass it via `--config baseUrl=<url>` which is unaffected by this setting.

### No linter / no build

There is no ESLint, Prettier, TypeScript, or build step configured. The only meaningful command to verify the project is `npx cypress verify` and running the test suite itself.

