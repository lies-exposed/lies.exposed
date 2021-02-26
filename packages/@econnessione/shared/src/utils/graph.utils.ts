// responsive utils for axis ticks
export function numTicksForHeight(height: number): number {
  if (height <= 300) return 3;
  if (height > 300 && height <= 600) return 5;
  return 10;
}

export function numTicksForWidth(width: number): number {
  if (width <= 300) return 2;
  if (width > 300 && width <= 400) return 5;
  return 10;
}
