import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { GetListQuery } from "../io/http/Query";
import { User, UserPermission } from "../io/http/User";
import { ResourceEndpoints } from "./types";

export const UserLogin = Endpoint({
  Method: "POST",
  getPath: () => "/users/login",
  Input: {
    Body: t.strict({ username: t.string, password: t.string }),
  },
  Output: t.strict({ data: t.strict({ token: t.string }) }),
});

export const UserCreate = Endpoint({
  Method: "POST",
  getPath: () => "/users",
  Input: {
    Body: t.strict(
      {
        username: t.string,
        firstName: t.string,
        lastName: t.string,
        permissions: t.array(UserPermission),
        email: t.string,
        password: t.string,
      },
      "UserCreateBody"
    ),
  },
  Output: t.strict({
    data: User,
  }),
});

export const UserGet = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/users/${id}`,
  Input: {
    Query: GetListQuery,
    Params: t.type({ id: t.string }),
  },
  Output: t.strict({ data: t.array(User), total: t.number }),
});

export const GetUserMe = Endpoint({
  Method: "GET",
  getPath: () => `/users/me`,
  Input: {
    Query: GetListQuery,
  },
  Output: User,
});

export const UserList = Endpoint({
  Method: "GET",
  getPath: () => "/users",
  Input: {
    Query: GetListQuery,
  },
  Output: t.strict({ data: t.array(User), total: t.number }),
});

export const users = ResourceEndpoints({
  Get: UserGet,
  Create: UserCreate,
  List: UserList,
  Edit: Endpoint({
    Method: "PUT",
    getPath: () => `/users`,
    Input: {
      Body: t.unknown,
    },
    Output: t.undefined,
  }),
  Delete: Endpoint({
    Method: "DELETE",
    getPath: () => `/users`,
    Output: t.undefined,
  }),
  Custom: {
    GetUserMe
  },
});
