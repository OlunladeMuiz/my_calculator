import { canAppendDot, getLastNonSpaceChar, isOperatorChar, sanitizeExpressionForEngine } from '../utils/expression.js';
import { evaluateExpression } from '../engine/evaluator.js';

function snapshotOf(state) {
  return {
    expression: state.expression,
    result: state.result,
    error: state.error,
  };
}

function withHistory(state, next, { record = true } = {}) {
  if (!record) return next;
  const past = [...state.history.past, snapshotOf(state)];
  return { ...next, history: { past, future: [] } };
}

export const initialState = {
  expression: '',
  result: null,
  error: null,
  history: { past: [], future: [] },
};

export function reducer(state, action) {
  switch (action.type) {
    case 'CLEAR_ALL':
      return withHistory(state, { ...initialState }, { record: true });

    case 'BACKSPACE': {
      if (!state.expression) return state;
      return withHistory(state, {
        ...state,
        expression: state.expression.slice(0, -1),
        error: null,
        result: null,
      });
    }

    case 'INPUT_DIGIT': {
      const digit = String(action.digit);
      if (!/^[0-9]$/.test(digit)) return state;
      return withHistory(state, {
        ...state,
        expression: `${state.expression}${digit}`,
        error: null,
        result: null,
      });
    }

    case 'INPUT_DOT': {
      if (!canAppendDot(state.expression)) return state;
      const last = getLastNonSpaceChar(state.expression);
      const prefix = last == null || isOperatorChar(last) || last === '(' ? '0' : '';
      return withHistory(state, {
        ...state,
        expression: `${state.expression}${prefix}.`,
        error: null,
        result: null,
      });
    }

    case 'INPUT_PAREN': {
      const value = action.value;
      if (value !== '(' && value !== ')') return state;
      return withHistory(state, {
        ...state,
        expression: `${state.expression}${value}`,
        error: null,
        result: null,
      });
    }

    case 'INPUT_OPERATOR': {
      const op = String(action.operator);
      if (!['+', '-', '*', '/'].includes(op)) return state;

      const trimmed = state.expression.trimEnd();
      const last = getLastNonSpaceChar(trimmed);

      // Allow leading unary minus.
      if (!last) {
        if (op === '-') {
          return withHistory(state, { ...state, expression: '-', error: null, result: null });
        }
        return state;
      }

      // Prevent `..` like `1++` by replacing last operator.
      if (isOperatorChar(last)) {
        const replaced = trimmed.slice(0, -1) + op;
        return withHistory(state, { ...state, expression: replaced, error: null, result: null });
      }

      return withHistory(state, {
        ...state,
        expression: `${trimmed}${op}`,
        error: null,
        result: null,
      });
    }

    case 'EVALUATE': {
      const expr = sanitizeExpressionForEngine(state.expression);
      if (!expr) return state;
      try {
        const value = evaluateExpression(expr, { precision: 20 });
        return withHistory(state, {
          ...state,
          result: value.toString(),
          error: null,
        });
      } catch (e) {
        const message = e?.code === 'DIV_BY_ZERO' ? 'Error: division by zero' : `Error: ${e?.message ?? 'Invalid expression'}`;
        return withHistory(state, {
          ...state,
          result: null,
          error: message,
        });
      }
    }

    case 'UNDO': {
      const past = state.history.past;
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const nextPast = past.slice(0, -1);
      const future = [snapshotOf(state), ...state.history.future];
      return {
        ...state,
        ...previous,
        history: { past: nextPast, future },
      };
    }

    case 'REDO': {
      const future = state.history.future;
      if (future.length === 0) return state;
      const next = future[0];
      const nextFuture = future.slice(1);
      const past = [...state.history.past, snapshotOf(state)];
      return {
        ...state,
        ...next,
        history: { past, future: nextFuture },
      };
    }

    default:
      return state;
  }
}

export function createStore(reducerFn, preloadedState) {
  let state = preloadedState;
  const listeners = new Set();

  return {
    getState() {
      return state;
    },
    dispatch(action) {
      state = reducerFn(state, action);
      for (const l of listeners) l(state);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
