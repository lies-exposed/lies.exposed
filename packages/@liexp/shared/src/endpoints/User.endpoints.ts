import { Schema } from "effect";
import { Endpoint } from "ts-endpoint";
import { OptionFromNullishToNull } from "../io/http/Common/OptionFromNullishToNull.js";
import { Output } from "../io/http/Common/Output.js";
import { UUID } from "../io/http/Common/UUID.js";
import { GetListQuery } from "../io/http/Query/index.js";
import {
  EditUserBody,
  SignUpUserBody,
  User,
  UserPermission,
} from "../io/http/User.js";
import { ResourceEndpoints } from "./types.js";

const OutputUser = Output(User).annotations({ title: "User" });

const UserCreate = Endpoint({
  Method: "POST",
  getPath: () => "/users",
  Input: {
    Body: Schema.Struct({
      ...SignUpUserBody.fields,
      permissions: Schema.Array(UserPermission),
    }).annotations({
      title: "UserCreateBody",
    }),
  },
  Output: OutputUser,
});

const UserEdit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/users/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: EditUserBody,
  },
  Output: OutputUser,
});

const SignUpUser = Endpoint({
  Method: "POST",
  getPath: () => "/users/signup",
  Input: {
    Body: SignUpUserBody,
  },
  Output: Schema.Struct({
    data: User,
  }),
});

const UserGet = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/users/${id}`,
  Input: {
    Query: GetListQuery,
    Params: Schema.Struct({ id: UUID }),
  },
  Output: OutputUser,
});

const GetUserMe = Endpoint({
  Method: "GET",
  getPath: () => `/users/me`,
  Input: {
    Query: GetListQuery,
  },
  Output: OutputUser,
});

const EditUserMe = Endpoint({
  Method: "PUT",
  getPath: () => `/users/me`,
  Input: {
    Body: EditUserBody,
  },
  Output: OutputUser,
});

const UserList = Endpoint({
  Method: "GET",
  getPath: () => "/users",
  Input: {
    Query: Schema.Struct({
      ...GetListQuery.fields,
      ids: OptionFromNullishToNull(Schema.Array(UUID)),
      telegramId: OptionFromNullishToNull(Schema.String),
      permissions: OptionFromNullishToNull(Schema.Array(UserPermission)),
    }),
  },
  Output: Schema.Struct({ data: Schema.Array(User), total: Schema.Number }),
});

const UserDelete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/users/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: Schema.Undefined,
});

// custom

const UserLogin = Endpoint({
  Method: "POST",
  getPath: () => "/users/login",
  Input: {
    Body: Schema.Union(
      Schema.Struct({ username: Schema.String, password: Schema.String }),
      Schema.Struct({ username: Schema.String, token: Schema.String }),
    ),
  },
  Output: Schema.Struct({
    data: Schema.Struct({ id: UUID, token: Schema.String }),
  }),
});

const UserTGTokenGenerate = Endpoint({
  Method: "POST",
  getPath: () => "/users/tg/token",
  Input: {
    Body: Schema.Struct({}),
  },
  Output: Schema.Struct({ data: Schema.Struct({ token: Schema.String }) }),
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
    UserLogin,
  },
});
