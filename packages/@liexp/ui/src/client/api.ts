import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { API } from "@liexp/shared/lib/providers/api/api.provider.js";
import * as http from "@liexp/shared/lib/providers/api-rest.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type AxiosError } from "axios";
import {
  type UserIdentity,
  type AuthProvider,
} from "../components/admin/react-admin.js";

export const api = API({
  baseURL: process.env.API_URL,
});

const publicDataProvider = http.APIRESTClient({
  url: process.env.API_URL,
});

export const apiProvider = http.APIRESTClient({
  url: process.env.API_URL,
  getAuth: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth");
      return token;
    }
    return null;
  },
});

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const response = await publicDataProvider.create<{ token: string }>(
      "users/login",
      {
        data: { username, password },
      },
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
    console.error(e.response?.data);
    return Promise.resolve();
  },
  getPermissions: async () => {
    const user = localStorage.getItem("user");
    return await pipe(
      user,
      fp.O.fromNullable,
      fp.O.chainNullableK((u) => JSON.parse(u)?.permissions),
      fp.E.fromOption(() => new Error("User is missing")),
      fp.TE.fromEither,
      throwTE,
    );
  },
  getIdentity: async () => {
    const getUserIdentity = apiProvider
      .getOne("users", {
        id: "me",
      })
      .then((res) => {
        const user: UserIdentity = res.data;
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
        return user;
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log("error", e);
        void authProvider
          .checkError(e)
          .then(() => {
            // eslint-disable-next-line no-console
            console.log("error checked, logout");
            return authProvider.logout({});
          })
          .then(authProvider.logout);
      }) as Promise<UserIdentity>;

    return await getUserIdentity;
  },
};
