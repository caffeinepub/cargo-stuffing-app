// Color generation utility for cargo items
export function generateCargoColor(id: string): string {
  // Generate a consistent color based on item ID using HSL
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use golden ratio for better color distribution
  const hue = (hash * 137.508) % 360;
  
  // Keep saturation and lightness in a good range for visibility
  const saturation = 65 + (hash % 20);
  const lightness = 55 + (hash % 15);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export const CARGO_COLOR_PALETTE = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export function getCargoColorFromPalette(index: number): string {
  return CARGO_COLOR_PALETTE[index % CARGO_COLOR_PALETTE.length];
}
