document.addEventListener('DOMContentLoaded', function () {
    const display = document.querySelector('.display');
    const buttons = document.querySelectorAll('.buttons button');
    let current = '';
    let operator = '';
    let previous = '';
    let resultShown = false;

    function updateDisplay(value) {
        display.textContent = value || '0';
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            const val = btn.textContent;

            if (btn.classList.contains('clear')) {
                current = '';
                operator = '';
                previous = '';
                resultShown = false;
                updateDisplay('0');
            } else if (btn.classList.contains('operator')) {
                if (current) {
                    if (operator && previous) {
                        previous = calculate(previous, current, operator);
                        current = '';
                    } else {
                        previous = current;
                        current = '';
                    }
                }
                operator = val;
                resultShown = false;
                // Show operator in display
                updateDisplay((previous || '0') + ' ' + operator);
            } else if (btn.classList.contains('equal')) {
                if (operator && previous && current) {
                    const result = calculate(previous, current, operator);
                    updateDisplay(result);
                    current = result;
                    previous = '';
                    operator = '';
                    resultShown = true;
                }
            } else {
                // Number or dot
                if (resultShown) {
                    current = '';
                    resultShown = false;
                }
                if (val === '.' && current.includes('.')) return;
                current += val;
                // Show operator if present
                if (operator && previous) {
                    updateDisplay(previous + ' ' + operator + ' ' + current);
                } else {
                    updateDisplay(current);
                }
            }
        });
    });

    function calculate(a, b, op) {
        a = parseFloat(a);
        b = parseFloat(b);
        switch (op) {
            case '+': return (a + b).toString();
            case '−': return (a - b).toString();
            case '×': return (a * b).toString();
            case '÷': return b !== 0 ? (a / b).toString() : 'Error';
            default: return b.toString();
      }
    }
});