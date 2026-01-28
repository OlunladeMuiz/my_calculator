import { Decimal } from '../utils/decimal.js';
import { tokenize } from './tokenizer.js';
import { parse } from './parser.js';

function evalNode(node, { precision }) {
  switch (node.type) {
    case 'NumberLiteral':
      return Decimal.fromString(node.value);

    case 'UnaryExpression': {
      const v = evalNode(node.argument, { precision });
      if (node.operator !== '-') {
        throw new Error(`Unsupported unary operator: ${node.operator}`);
      }
      return new Decimal(-v.value, v.scale).normalize();
    }

    case 'BinaryExpression': {
      const left = evalNode(node.left, { precision });
      const right = evalNode(node.right, { precision });
      switch (node.operator) {
        case '+':
          return left.add(right);
        case '-':
          return left.sub(right);
        case '*':
          return left.mul(right);
        case '/':
          return left.div(right, precision);
        default:
          throw new Error(`Unsupported operator: ${node.operator}`);
      }
    }

    default:
      throw new Error(`Unknown AST node: ${node.type}`);
  }
}

export function evaluateAst(ast, options = {}) {
  const precision = Number.isInteger(options.precision) ? options.precision : 20;
  return evalNode(ast, { precision });
}

export function evaluateExpression(expression, options = {}) {
  const precision = Number.isInteger(options.precision) ? options.precision : 20;
  const tokens = tokenize(expression);
  const ast = parse(tokens);
  return evaluateAst(ast, { precision });
}
