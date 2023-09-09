import { API } from "@liexp/shared/lib/providers/api/api.provider";

export const api = API({
  baseURL: process.env.API_URL,
});
