import { API } from "@econnessione/shared/providers/api.provider";

export const api = API({
  baseURL: process.env.REACT_APP_API_URL,
});
