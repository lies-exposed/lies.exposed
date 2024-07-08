import polyglotI18nProvider from "ra-i18n-polyglot";
import { type I18nProvider } from "../components/admin/react-admin.js";
import englishMessages from "./en-US.js";

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");

export { i18nProvider };
export type { I18nProvider };
