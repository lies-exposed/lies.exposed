import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import type * as http from "@liexp/shared/lib/providers/api-rest.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type AxiosError } from "axios";
import {
  type AuthProvider,
  type UserIdentity,
} from "../components/admin/react-admin.js";

export const getAuthFromLocalStorage = (): string | null => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth");
    return token;
  }
  return null;
};

export const GetAuthProvider = (
  publicDataProvider: http.APIRESTClient,
): AuthProvider => {
  const clearLocalStorage = (): void => {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
  };

  const checkError = (e: AxiosError): Promise<void> => {
    // eslint-disable-next-line no-console
    console.error("check error", e.code, e.response?.status, e.message);

    const errorData = new Error(JSON.stringify(e?.response?.data));
    if (e?.response?.status === 401) {
      clearLocalStorage();
      return Promise.reject(errorData);
    }
    return Promise.resolve();
  };

  const logout = async (p: { redirectTo?: string }): Promise<void> => {
    clearLocalStorage();
    await Promise.resolve({ redirectTo: p.redirectTo ?? "/login" });
  };

  return {
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
    logout,
    checkAuth: async () => {
      const auth = localStorage.getItem("auth");
      // console.log("auth", auth);
      auth
        ? await Promise.resolve()
        : // eslint-disable-next-line prefer-promise-reject-errors
          await Promise.reject();
    },
    checkError,
    getPermissions: async () => {
      const user = localStorage.getItem("user");
      return pipe(
        user,
        fp.O.fromNullable,
        fp.O.chainNullableK((u) => JSON.parse(u)?.permissions),
        fp.E.fromOption(
          () =>
            new APIError("User is missing", [
              "User is missing in local storage",
            ]),
        ),
        fp.TE.fromEither,
        throwTE,
      );
    },
    getIdentity: async () => {
      const getUserIdentity = publicDataProvider
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
          console.log("error fetching identity", e);
          return checkError(e).catch((err) => {
            // eslint-disable-next-line no-console
            console.log("error checkError, ", err);
            throw err;
          });
        }) as Promise<UserIdentity>;

      return getUserIdentity;
    },
  };
};
