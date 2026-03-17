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

## Authentication (Cloudassistant)

When implementing `cy.login()`:

- Centralize the flow in `cypress/support/commands.js`.
- Avoid repeating the same login in every test if you can cache state (when applicable) without breaking isolation.
- Use `cy.session()` if it improves performance while keeping stability.

## CI / headless execution

- Prefer injecting secrets via CI runner environment variables instead of files.
- Never commit `cypress.env.json` with secrets.

