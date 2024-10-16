export function round(num: number, decimalPlaces = 2) {
  const mul = Math.pow(10, decimalPlaces);
  return Math.round((num + Number.EPSILON) * mul) / mul;
}
