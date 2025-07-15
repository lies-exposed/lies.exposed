import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  APIError,
  toAPIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type APIRESTClient } from "@ts-endpoint/react-admin";
import { type AxiosError } from "axios";
import { Schema } from "effect";
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
  publicDataProvider: APIRESTClient,
): AuthProvider => {
  const clearLocalStorage = (): void => {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
  };

  const checkError = async (e: AxiosError | APIError): Promise<void> => {
    // eslint-disable-next-line no-console
    console.log("Checking error", e);
    const isAPIError = Schema.is(APIError)(e);
    const errorData = isAPIError ? e : e.response?.data;
    const error = new Error(e.name);
    error.cause = JSON.stringify(errorData);

    const is401 = isAPIError ? e.status === 401 : e.response?.status === 401;
    if (is401) {
      // If the error is an APIError, we can handle it accordingly

      clearLocalStorage();

      throw error;
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
      if (auth) {
        await Promise.resolve();
      } else {
        await Promise.reject(new Error("Not authenticated"));
      }
    },
    checkError,
    getPermissions: async () => {
      const user = localStorage.getItem("user");
      return pipe(
        user,
        fp.O.fromNullable,
        fp.O.chainNullableK((u) => JSON.parse(u)?.permissions),
        fp.E.fromOption(() => toAPIError("User is missing in local storage")),
        fp.E.mapLeft((e) => ({ ...e, status: 401 })),
        fp.TE.fromEither,
        throwTE,
      );
    },
    getIdentity: async () => {
      return publicDataProvider
        .getOne("users", {
          id: "me",
        })
        .then((res) => {
          const user: UserIdentity = res.data;
          if (user) {
            localStorage.setItem("user", JSON.stringify(user));
          }
          return user;
        });
    },
  };
};
