import { absBigInt, pow10 } from './bigint.js';

export class Decimal {
  constructor(value, scale) {
    if (typeof value !== 'bigint') {
      throw new TypeError('Decimal value must be a bigint');
    }
    if (!Number.isInteger(scale) || scale < 0) {
      throw new TypeError('Decimal scale must be a non-negative integer');
    }
    this.value = value;
    this.scale = scale;
  }

  static zero() {
    return new Decimal(0n, 0);
  }

  static fromString(input) {
    const raw = String(input).trim();
    if (raw.length === 0) {
      throw new Error('Empty number');
    }

    let sign = 1n;
    let cursor = 0;
    if (raw[0] === '+') {
      cursor = 1;
    } else if (raw[0] === '-') {
      sign = -1n;
      cursor = 1;
    }

    const str = raw.slice(cursor);
    if (!/^(\d+(\.\d*)?|\.\d+)$/.test(str)) {
      throw new Error(`Invalid number: ${input}`);
    }

    const [intPartRaw, fracPartRaw = ''] = str.split('.');
    const intPart = intPartRaw === '' ? '0' : intPartRaw;
    const fracPart = fracPartRaw;
    const scale = fracPart.length;
    const digits = `${intPart}${fracPart}`.replace(/^0+(?=\d)/, '');
    const value = BigInt(digits === '' ? '0' : digits) * sign;

    return new Decimal(value, scale).normalize();
  }

  isZero() {
    return this.value === 0n;
  }

  normalize() {
    if (this.value === 0n) {
      return new Decimal(0n, 0);
    }

    let value = this.value;
    let scale = this.scale;
    while (scale > 0 && value % 10n === 0n) {
      value /= 10n;
      scale -= 1;
    }
    return new Decimal(value, scale);
  }

  withScale(targetScale) {
    if (!Number.isInteger(targetScale) || targetScale < 0) {
      throw new TypeError('targetScale must be a non-negative integer');
    }
    if (targetScale === this.scale) return this;
    if (targetScale > this.scale) {
      const factor = pow10(targetScale - this.scale);
      return new Decimal(this.value * factor, targetScale);
    }
    const factor = pow10(this.scale - targetScale);
    return new Decimal(this.value / factor, targetScale);
  }

  add(other) {
    const scale = Math.max(this.scale, other.scale);
    const a = this.withScale(scale);
    const b = other.withScale(scale);
    return new Decimal(a.value + b.value, scale).normalize();
  }

  sub(other) {
    const scale = Math.max(this.scale, other.scale);
    const a = this.withScale(scale);
    const b = other.withScale(scale);
    return new Decimal(a.value - b.value, scale).normalize();
  }

  mul(other) {
    return new Decimal(this.value * other.value, this.scale + other.scale).normalize();
  }

  div(other, precision = 20) {
    if (other.isZero()) {
      const err = new Error('Division by zero');
      err.code = 'DIV_BY_ZERO';
      throw err;
    }
    if (!Number.isInteger(precision) || precision < 0) {
      throw new TypeError('precision must be a non-negative integer');
    }

    const numerator = this.value * pow10(other.scale + precision);
    const denominator = other.value * pow10(this.scale);

    let q = numerator / denominator;
    const r = numerator % denominator;

    const twiceAbsR = absBigInt(r) * 2n;
    const absDen = absBigInt(denominator);
    if (twiceAbsR >= absDen) {
      q += (q >= 0n ? 1n : -1n);
    }

    return new Decimal(q, precision).normalize();
  }

  toString() {
    if (this.scale === 0) return this.value.toString();

    const sign = this.value < 0n ? '-' : '';
    const digits = absBigInt(this.value).toString();
    const pad = this.scale - digits.length;

    if (pad >= 0) {
      const zeros = '0'.repeat(pad + 1);
      const full = `${zeros}${digits}`;
      const intPart = full.slice(0, full.length - this.scale);
      const fracPart = full.slice(full.length - this.scale);
      return `${sign}${intPart}.${fracPart}`.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
    }

    const split = digits.length - this.scale;
    const intPart = digits.slice(0, split);
    const fracPart = digits.slice(split);
    return `${sign}${intPart}.${fracPart}`.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }
}
