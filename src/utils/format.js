export function formatNumberWithCommas(value) {
  const raw = String(value ?? '').trim();
  if (raw.length === 0) return '';

  // Preserve errors or non-numeric strings as-is.
  // Accepts: -123, 123.45, .5, -0.25
  const numericLike = /^[-+]?((\d+(\.\d*)?)|(\.\d+))$/.test(raw);
  if (!numericLike) return raw;

  let sign = '';
  let s = raw;
  if (s[0] === '-' || s[0] === '+') {
    sign = s[0] === '-' ? '-' : '';
    s = s.slice(1);
  }

  const [intRaw, fracRaw] = s.split('.');
  const intPart = intRaw === '' ? '0' : intRaw;

  // Insert commas in integer part.
  const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (fracRaw === undefined) return `${sign}${intWithCommas}`;
  if (fracRaw === '') return `${sign}${intWithCommas}.`;
  return `${sign}${intWithCommas}.${fracRaw}`;
}
