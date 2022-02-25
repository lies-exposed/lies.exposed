import { API } from "@liexp/shared/providers/api.provider";

export const api = API({
  baseURL: process.env.API_URL,
});
