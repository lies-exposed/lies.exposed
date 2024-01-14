import { API } from "@liexp/shared/lib/providers/api/api.provider.js";

export const api = API({
  baseURL: process.env.API_URL,
});
