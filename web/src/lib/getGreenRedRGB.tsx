export function getGreenRedRGB(value: number) {
  const scaledValue = value > 1 ? 1 : value;
  return `rgb(${Math.min(255, scaledValue * 255)}, ${Math.max(0, 255 - scaledValue * 255)}, 0)`;
}
