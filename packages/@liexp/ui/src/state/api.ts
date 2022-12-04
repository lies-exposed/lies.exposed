import { API } from "@liexp/shared/providers/http/api.provider";

export const api = API({
  baseURL: process.env.API_URL,
});
