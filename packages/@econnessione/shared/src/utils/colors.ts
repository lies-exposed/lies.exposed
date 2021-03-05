import { Color } from "@io/http/Common/Color";

export const generateRandomColor = (): Color =>
  Math.floor(Math.random() * 16777215).toString(16) as any;
