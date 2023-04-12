import { API } from "@liexp/shared/lib/providers/http/api.provider";

export const api = API({
  baseURL: process.env.API_URL,
});
