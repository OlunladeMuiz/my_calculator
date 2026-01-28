import { createStore, initialState, reducer } from './state/calculatorState.js';
import { createDomController } from './ui/domController.js';

function bootstrap() {
  const root = document.querySelector('[data-calculator-root]');
  if (!root) {
    throw new Error('Calculator root not found');
  }

  const store = createStore(reducer, initialState);
  createDomController({ root, store });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
