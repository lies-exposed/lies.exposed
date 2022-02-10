import { API } from '@econnessione/shared/providers/api.provider';

export const api = API({
  baseURL: process.env.API_URL,
});
