import { Schema } from "effect";
import { BaseProps } from "./Common/BaseProps.js";
import { OptionFromNullishToNull } from "./Common/OptionFromNullishToNull.js";
import { UUID } from "./Common/UUID.js";
import { GetListQuery } from "./Query/GetListQuery.js";
import { AuthPermission } from "./auth/permissions/index.js";

export const UserStatusPending = Schema.Literal("Pending");
export const UserStatusApproved = Schema.Literal("Approved");
export const UserStatusDeclined = Schema.Literal("Declined");
export const UserStatus = Schema.Union(
  UserStatusPending,
  UserStatusApproved,
  UserStatusDeclined,
).annotations({
  title: "UserStatus",
});
export type UserStatus = typeof UserStatus.Type;

export const ListUserQuery = Schema.Struct({
  ...GetListQuery.fields,
  ids: OptionFromNullishToNull(Schema.Array(UUID)),
  telegramId: OptionFromNullishToNull(Schema.String),
  permissions: OptionFromNullishToNull(Schema.Array(AuthPermission)),
});

export const SignUpUserBody = Schema.Struct({
  username: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
  email: Schema.String,
  password: Schema.String,
  permissions: Schema.Array(AuthPermission),
}).annotations({
  title: "SignUpUserBody",
});
export type SignUpUserBody = typeof SignUpUserBody.Type;

export const EditUserBody = Schema.Struct({
  ...SignUpUserBody.omit("password").fields,
  telegramId: Schema.Union(Schema.String, Schema.Null),
  status: UserStatus,
}).annotations({
  title: "EditUserBody",
});
export type EditUserBody = typeof EditUserBody.Type;

export const User = Schema.Struct({
  ...BaseProps.fields,
  firstName: Schema.String,
  lastName: Schema.String,
  username: Schema.String,
  email: Schema.String,
  status: UserStatus,
  permissions: Schema.Array(AuthPermission),
  telegramId: Schema.Union(Schema.String, Schema.Null),
  telegramToken: Schema.Union(Schema.String, Schema.Null),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
}).annotations({ title: "User" });

export type User = typeof User.Type;

export type UserEncoded = Schema.Schema.Encoded<typeof User>;
