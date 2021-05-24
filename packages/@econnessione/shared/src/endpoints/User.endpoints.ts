import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { GetListQuery } from "../io/http/Query";
import { User } from "../io/http/User";

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

export const UserList = Endpoint({
  Method: "GET",
  getPath: () => "/users",
  Input: {
    Query: GetListQuery,
  },
  Output: t.strict({ data: t.array(User), total: t.number }),
});
