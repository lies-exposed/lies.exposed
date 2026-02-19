import { type Color } from "@liexp/io/lib/http/Common/Color.js";

export const generateRandomColor = (): Color => {
  return Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0") as Color;
};

export const toColor = (s: string): Color =>
  (s?.startsWith("#") ? s.replace("#", "") : s) as Color;

export const toColorHash = (s: string): string =>
  s.startsWith("#") ? s : "#".concat(s);
