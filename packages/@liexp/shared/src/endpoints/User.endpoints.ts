import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { Endpoint } from "ts-endpoint";
import { Output } from "../io/http/Common/Output.js";
import { GetListQuery } from "../io/http/Query/index.js";
import {
  EditUserBody,
  SignUpUserBody,
  User,
  UserPermission,
} from "../io/http/User.js";
import { ResourceEndpoints } from "./types.js";

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
        ...SignUpUserBody.type.props,
        permissions: t.array(UserPermission),
      },
      "UserCreateBody",
    ),
  },
  Output: t.strict({
    data: User,
  }),
});

export const UserEdit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/users/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: EditUserBody,
  },
  Output: t.strict({
    data: User,
  }),
});

export const SignUpUser = Endpoint({
  Method: "POST",
  getPath: () => "/users/signup",
  Input: {
    Body: SignUpUserBody,
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
    Params: t.type({ id: UUID }),
  },
  Output: t.strict({ data: User }),
});

export const GetUserMe = Endpoint({
  Method: "GET",
  getPath: () => `/users/me`,
  Input: {
    Query: GetListQuery,
  },
  Output: Output(User, "user"),
});

export const EditUserMe = Endpoint({
  Method: "PUT",
  getPath: () => `/users/me`,
  Input: {
    Body: EditUserBody,
  },
  Output: Output(User, "user"),
});

export const UserList = Endpoint({
  Method: "GET",
  getPath: () => "/users",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      ids: optionFromNullable(t.array(UUID)),
    }),
  },
  Output: t.strict({ data: t.array(User), total: t.number }),
});

const UserTGTokenGenerate = Endpoint({
  Method: "POST",
  getPath: () => "/users/tg/token",
  Input: {
    Body: t.strict({}),
  },
  Output: t.strict({ data: t.strict({ token: t.string }) }),
});

const UserDelete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/users/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: t.undefined,
});

export const users = ResourceEndpoints({
  Get: UserGet,
  Create: UserCreate,
  List: UserList,
  Edit: UserEdit,
  Delete: UserDelete,
  Custom: {
    GetUserMe,
    EditUserMe,
    SignUpUser,
    UserTGTokenGenerate,
  },
});
