import * as http from "@econnessione/ui/http";
import { AuthProvider } from "react-admin";
import { createProject } from "./ProjectAPI";

const publicDataProvider = http.APIRESTClient({
  url: process.env.REACT_APP_API_URL,
});

export const dataProvider = http.APIRESTClient({
  url: process.env.REACT_APP_API_URL,
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
      : await Promise.reject(new Error("Missing auth")),
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
};

export const apiProvider: http.APIRESTClient = {
  ...dataProvider,
  create: (resource, params) => {
    if (resource === "projects") {
      return createProject(dataProvider)(resource, params);
    }

    return dataProvider.create<any>(resource, params);
  },
};
