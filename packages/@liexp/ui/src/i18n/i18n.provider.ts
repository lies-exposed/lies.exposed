import { importDefault } from "@liexp/core/lib/esm/import-default.js";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "./en-US.js";

export const i18nProvider = importDefault(polyglotI18nProvider).default(
  () => englishMessages,
  "en",
);
