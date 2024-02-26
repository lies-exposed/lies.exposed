import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "./en-US.js";

export const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");
