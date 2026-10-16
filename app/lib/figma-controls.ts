// Dimensions from Figma controls 75:167 / 75:263 and room ellipse 3:203.
export const editorControls = {
  diameter: 98,
  width: 582,
  offsets: [0, 120, 240, 364, 484],
  gaps: [22, 22, 26, 22],
  iconSizes: { filter: 65, undo: 60, redo: 60, cancel: 70, save: 60 },
} as const;
export const designScale = (width: number, height: number) =>
  Math.min(width / 1920, height / 1080);

export const clothingPaletteScale = (width:number,height:number) => width<=720 ? Math.max(0,(width-32)/602) : Math.min(designScale(width,height),(width-32)/602);

export function editorControlScale(width: number, height: number) {
  if (width <= 720) {
    return Math.max(44 / 98, Math.min(62 / 98, (width - 32) / 582));
  }
  return Math.max(44 / 98, designScale(width, height));
}
