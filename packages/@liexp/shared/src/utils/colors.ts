import { type Color } from "../io/http/Common/Color";

export const generateRandomColor = (): Color =>
  Math.floor(Math.random() * 16777215).toString(16) as any;

export const toColor = (s: string): Color =>
  (s.startsWith("#") ? s.replace("#", "") : s) as any as Color;

export const toColorHash = (s: string): string =>
  s.startsWith("#") ? s : "#".concat(s);
