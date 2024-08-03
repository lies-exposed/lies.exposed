import { type Color } from "../io/http/Common/Color.js";

export const generateRandomColor = (): Color => {
  const c = Math.floor(Math.random() * 16777215).toString(16);
  if (c.length === 5) {
    return c.concat("1") as Color;
  }
  return c as Color;
};

export const toColor = (s: string): Color =>
  (s.startsWith("#") ? s.replace("#", "") : s) as Color;

export const toColorHash = (s: string): string =>
  s.startsWith("#") ? s : "#".concat(s);
