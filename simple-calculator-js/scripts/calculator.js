const display = document.getElementById('display');
const buttons = document.querySelectorAll('button[data-btn]');
let expression = '';
let currentInput = '';
let errorState = false;

function isOperator(ch) {
    return ['+', '-', '*', '/'].includes(ch);
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => handleClick(btn.dataset.btn));
});

function handleClick(btn) {
    if (errorState && btn !== 'C') return;

    if (!isNaN(btn) || btn === '.') {
        if (btn === '.' && currentInput.includes('.')) return;
        currentInput += btn;
        expression += btn;
        display.value = expression;
    } else if (btn === 'C') {
        expression = '';
        currentInput = '';
        errorState = false;
        display.value = '';
        display.classList.remove('error');
        buttons.forEach(b => b.disabled = false);
    } else if (btn === '=') {
        try {
            const result = evaluateExpression(expression);
            expression = Number.isFinite(result) ? result.toString() : 'Error';
            display.value = expression;
            currentInput = expression;
            if (expression === 'Error') activateError();
        } catch {
            display.value = 'Error';
            activateError();
        }
    } else {
        const last = expression.slice(-1);
        if (btn === '-' && (expression === '' || isOperator(last))) {
            if (currentInput === '') {
                currentInput = '-';
                expression += '-';
                display.value = expression;
            }
            return;
        }
        if (expression === '') return;
        if (isOperator(last)) {
            expression = expression.slice(0, -1) + btn;
            currentInput = '';
            display.value = expression;
            return;
        }
        expression += btn;
        currentInput = '';
        display.value = expression;
    }
}

function evaluateExpression(expr) {
    const tokens = tokenize(expr);
    const rpn = toRPN(tokens);
    return evalRPN(rpn);
}

function tokenize(expr) {
    const tokens = [];
    let num = '';
    for (let i = 0; i < expr.length; i++) {
        const ch = expr[i];
        const prev = i > 0 ? expr[i - 1] : '';
        if (/\d|\./.test(ch) || (ch === '-' && (i === 0 || isOperator(prev)))) {
            num += ch;
        } else if (isOperator(ch)) {
            if (num !== '') { tokens.push(num); num = ''; }
            tokens.push(ch);
        }
    }
    if (num !== '') tokens.push(num);
    return tokens;
}

function toRPN(tokens) {
    const out = [];
    const ops = [];
    const prec = { '+':1, '-':1, '*':2, '/':2 };
    tokens.forEach(t => {
        if (!isNaN(t)) {
            out.push(parseFloat(t));
        } else if (isOperator(t)) {
            while (ops.length && isOperator(ops[ops.length-1]) && prec[ops[ops.length-1]] >= prec[t]) {
                out.push(ops.pop());
            }
            ops.push(t);
        }
    });
    while (ops.length) out.push(ops.pop());
    return out;
}

function evalRPN(rpn) {
    const st = [];
    for (const t of rpn) {
        if (typeof t === 'number') st.push(t);
        else {
            const b = st.pop();
            const a = st.pop();
            if (t === '+') st.push(a + b);
            else if (t === '-') st.push(a - b);
            else if (t === '*') st.push(a * b);
            else if (t === '/') {
                if (b === 0) throw new Error('Division by zero');
                st.push(a / b);
            }
        }
    }
    return st.pop();
}

function activateError() {
    errorState = true;
    display.classList.add('error');
    buttons.forEach(b => { if (b.dataset.btn !== 'C') b.disabled = true; });
}
