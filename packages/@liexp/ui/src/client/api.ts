import { API } from "@liexp/shared/providers/http/api.provider";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { type AxiosError } from "axios";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { type AuthProvider } from "react-admin";
import * as http from "../http";

export const api = API({
  baseURL: process.env.API_URL,
});

const publicDataProvider = http.APIRESTClient({
  url: process.env.API_URL,
});

export const apiProvider = http.APIRESTClient({
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
    localStorage.removeItem("user");
    await Promise.resolve(undefined);
  },
  checkAuth: async () => {
    const auth = localStorage.getItem("auth");
    // console.log("auth", auth);
    auth
      ? await Promise.resolve()
      : // eslint-disable-next-line prefer-promise-reject-errors
        await Promise.reject();
  },
  checkError: (e: AxiosError) => {
    // console.log("check error", e);
    const errorData = new Error(JSON.stringify(e?.response?.data));
    if (e?.response?.status === 401) {
      return Promise.reject(errorData);
    }
    // eslint-disable-next-line no-console
    console.error(e);
    return Promise.resolve();
  },
  getPermissions: async () => {
    const user = localStorage.getItem("user");
    return await pipe(
      user,
      O.fromNullable,
      O.chainNullableK((u) => JSON.parse(u)?.permissions),
      E.fromOption(() => new Error("User is missing")),
      TE.fromEither,
      throwTE
    );
  },
  getIdentity: async () => {
    try {
      const user = await apiProvider.get("users/me", {});
      // console.log(user);

      localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (e) {
      return await authProvider.checkError(e).catch(authProvider.logout);
    }
  },
};
