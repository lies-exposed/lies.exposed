import { API } from "@liexp/shared/providers/api.provider";
import * as http from "@liexp/ui/http";
import { AuthProvider } from "react-admin";

export const api = API({
  baseURL: process.env.API_URL,
});

const publicDataProvider = http.APIRESTClient({
  url: process.env.API_URL,
});

export const httRestClient = http.APIRESTClient({
  url: process.env.API_URL,
  getAuth: () => {
    const token = localStorage.getItem("auth");
    return token;
  },
});

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const response = await publicDataProvider.create<{ token: string }>(
      "users/login",
      {
        data: { username, password },
      }
    );

    localStorage.setItem("auth", response.data.token);
    return response;
  },
  logout: async () => {
    localStorage.removeItem("auth");
    return await Promise.resolve(undefined);
  },
  checkAuth: async () =>
    localStorage.getItem("auth")
      ? await Promise.resolve()
      : // eslint-disable-next-line prefer-promise-reject-errors
        await Promise.reject(),
  checkError: (e) => {
    if (e?.response?.status === 401) {
      return Promise.reject(new Error(e.response.body.message));
    }

    return Promise.resolve();
  },
  getPermissions: () => Promise.resolve(),
};
