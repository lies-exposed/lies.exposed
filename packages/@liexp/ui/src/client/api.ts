import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { APIError } from "@liexp/io/lib/http/Error/APIError.js";
import { toAPIError } from "@liexp/shared/lib/utils/APIError.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
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

  const handleUnauthorized = (): void => {
    clearLocalStorage();
    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const checkError = async (error: AxiosError | APIError): Promise<void> => {
    // eslint-disable-next-line no-console
    console.log("Checking error", error);
    const isAPIError = Schema.is(APIError)(error);
    const errorData = isAPIError ? error : error.response?.data;
    const err = new Error(error.name);
    err.cause = JSON.stringify(errorData);

    const is401 = isAPIError ? error.status === 401 : error.response?.status === 401;
    if (is401) {
      // Clear authentication on 401 Unauthorized
      handleUnauthorized();
      // Reject the promise so react-admin knows about the error
      throw new Error("Unauthorized - Session expired");
    }

    // Don't suppress errors - let react-admin handle other errors
    // but don't trigger logout for non-401 errors
    return Promise.resolve();
  };

  const logout = async (p: { redirectTo?: string }): Promise<void> => {
    clearLocalStorage();
    const redirectTo = p.redirectTo ?? "/login";
    if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
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
