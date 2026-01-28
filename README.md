# 2026 Employer‑Grade Vanilla JS Calculator

This is not a “demo calculator” that just glues button clicks to `eval()`.
It’s a small, production-style app with explicit layering, a real expression engine, and unit tests.

## Why this isn’t trivial

Building a calculator that feels correct is deceptively hard:

- **Parsing is real engineering**: operator precedence (PEMDAS), parentheses, and unary minus require an actual parser.
- **Decimals can’t use floating point**: `0.1 + 0.2` must equal `0.3`. This project uses **BigInt-backed fixed-point decimals**.
- **State can’t be implicit**: a calculator is a state machine (expression building, errors, evaluation). This project uses a reducer + explicit actions with undo/redo.

## Architecture (required separation)

### `src/engine/` — math only

- `tokenizer.js`: converts a string into tokens (numbers/operators/parentheses)
- `parser.js`: turns tokens into an AST using precedence + unary minus rules
- `evaluator.js`: evaluates the AST using exact decimal arithmetic (no DOM, no browser APIs)

**Why**: you can import the engine in a CLI tool, a backend, or a React app without touching the UI.

### `src/state/` — explicit state machine

- `calculatorState.js`: reducer, action types, and a tiny store abstraction (dispatch/subscribe)

**Why**: all state transitions are explicit, predictable, and testable. UI never mutates “hidden” variables.

### `src/ui/` — DOM only

- `domController.js`: event delegation + keyboard handling + rendering

**Why**: keeps business logic out of the DOM and makes UI changes safe.

### `src/utils/` — helpers

- `decimal.js`: BigInt fixed-point decimal implementation
- `expression.js`: input helpers and operator normalization

## Running

For local development, use a local server (ES modules won’t reliably run via `file://`).
If you use VS Code, the “Live Server” extension works well.

## Tests

This project uses Node’s built-in test runner (no framework required).

- Run: `npm test`
- Under the hood: `node --test`

Tests focus on edge cases:

- Tokenization of unicode operators (× ÷ −)
- Precedence + parentheses
- Unary minus
- Exact decimal behavior (`0.1 + 0.2`)
- Division-by-zero

## How this scales to React / full-stack

- `src/engine/` becomes a shared package (or a backend service) with the same test suite.
- `src/state/` maps directly to Redux / Zustand / XState patterns.
- `src/ui/` is easily replaced by React components while keeping engine + reducer unchanged.

## Next production upgrades

- Display formatting: scientific notation for very large/small numbers
- Copy/paste full expressions + input cursor editing
- More operators (%, exponentiation, memory keys)
- E2E tests (Playwright) for keyboard/mouse parity
