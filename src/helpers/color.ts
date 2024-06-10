import Color from "colorjs.io";


const MIN_DARK_LUM = 0;
const MAX_DARK_LUM = 100;
const DARK_AMP = MAX_DARK_LUM - MIN_DARK_LUM;
// we use a power < 1 in order to prevent contrast to crunch between dark colors
const DARK_TRANSFORM_POWER = 0.6;
const bijection = (_: number) => Math.pow(1 - _, DARK_TRANSFORM_POWER);

const darkenLuminosity = (l: number) => {
  return Math.round(MIN_DARK_LUM + DARK_AMP * bijection(l / 100));
};

const toHex = (numFrom0To1: number): number => Math.round(numFrom0To1 * 256)

export const darkenColor = (colorString: string) => {
  const color = new Color(colorString);
  color.lch.l = darkenLuminosity(color.lch.l);
  const { r, g, b } = color.srgb;
  return `rgba(${toHex(r)}, ${toHex(g)}, ${toHex(b)}, ${color.alpha})`;
};