const PALETTE_COLORS = ["#d62411", "#e1afa1", "#bdc9cb"];

export const getRandomPaletteColor = () => {
  return PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)];
};
