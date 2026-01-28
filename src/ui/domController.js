import { formatNumberWithCommas } from '../utils/format.js';

const KEY_TO_ACTION = new Map([
  ['Enter', { type: 'EVALUATE' }],
  ['=', { type: 'EVALUATE' }],
  ['Backspace', { type: 'BACKSPACE' }],
  ['Escape', { type: 'CLEAR_ALL' }],
]);

function isTextInputTarget(target) {
  return target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
}

export function createDomController({ root, store }) {
  if (!(root instanceof HTMLElement)) {
    throw new Error('DOM controller requires a root HTMLElement');
  }

  const expressionEl = root.querySelector('#calc-expression');
  const resultEl = root.querySelector('#calc-result');
  const errorEl = root.querySelector('#calc-error');
  const buttonsEl = root.querySelector('.buttons');

  if (!expressionEl || !resultEl || !errorEl || !buttonsEl) {
    throw new Error('Calculator UI elements not found');
  }

  function render(state) {
    expressionEl.textContent = state.expression || '0';
    resultEl.textContent = state.result == null ? '' : formatNumberWithCommas(state.result);
    errorEl.textContent = state.error ?? '';
    root.dataset.hasError = state.error ? 'true' : 'false';
  }

  const unsubscribe = store.subscribe(render);
  render(store.getState());

  buttonsEl.addEventListener('click', (event) => {
    const button = event.target instanceof HTMLElement ? event.target.closest('button') : null;
    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {
      case 'clear':
        store.dispatch({ type: 'CLEAR_ALL' });
        break;
      case 'digit':
        store.dispatch({ type: 'INPUT_DIGIT', digit: value });
        break;
      case 'dot':
        store.dispatch({ type: 'INPUT_DOT' });
        break;
      case 'operator':
        store.dispatch({ type: 'INPUT_OPERATOR', operator: value });
        break;
      case 'paren':
        store.dispatch({ type: 'INPUT_PAREN', value });
        break;
      case 'evaluate':
        store.dispatch({ type: 'EVALUATE' });
        break;
      default:
        break;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (isTextInputTarget(event.target)) return;

    const key = event.key;

    // Undo/redo
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const mod = isMac ? event.metaKey : event.ctrlKey;
    if (mod && (key === 'z' || key === 'Z')) {
      event.preventDefault();
      store.dispatch({ type: event.shiftKey ? 'REDO' : 'UNDO' });
      return;
    }

    const mapped = KEY_TO_ACTION.get(key);
    if (mapped) {
      event.preventDefault();
      store.dispatch(mapped);
      return;
    }

    if (/^[0-9]$/.test(key)) {
      event.preventDefault();
      store.dispatch({ type: 'INPUT_DIGIT', digit: key });
      return;
    }

    if (key === '.') {
      event.preventDefault();
      store.dispatch({ type: 'INPUT_DOT' });
      return;
    }

    if (key === '(' || key === ')') {
      event.preventDefault();
      store.dispatch({ type: 'INPUT_PAREN', value: key });
      return;
    }

    if (key === '+' || key === '-' || key === '*' || key === '/') {
      event.preventDefault();
      store.dispatch({ type: 'INPUT_OPERATOR', operator: key });
    }
  });

  return {
    destroy() {
      unsubscribe();
    },
  };
}
