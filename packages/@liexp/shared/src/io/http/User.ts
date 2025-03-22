import { Schema } from "effect";
import { BaseProps } from "./Common/BaseProps.js";

export const EventSuggestionCreate = Schema.Literal("event-suggestion:create");
export const EventSuggestionRead = Schema.Literal("event-suggestion:read");
export const EventSuggestionEdit = Schema.Literal("event-suggestion:create");
export const AdminRead = Schema.Literal("admin:read");
export const AdminCreate = Schema.Literal("admin:create");
export const AdminEdit = Schema.Literal("admin:edit");
export const AdminDelete = Schema.Literal("admin:delete");

export const UserPermission = Schema.Union(
  EventSuggestionCreate,
  EventSuggestionRead,
  EventSuggestionEdit,
  AdminRead,
  AdminCreate,
  AdminEdit,
  AdminDelete,
).annotations({
  title: "UserPermission",
});
export type UserPermission = typeof UserPermission.Type;

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

export const SignUpUserBody = Schema.Struct({
  username: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
  email: Schema.String,
  password: Schema.String,
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
  permissions: Schema.Array(UserPermission),
  telegramId: Schema.Union(Schema.String, Schema.Null),
  telegramToken: Schema.Union(Schema.String, Schema.Null),
  createdAt: Schema.String,
  updatedAt: Schema.String,
}).annotations({ title: "User" });

export type User = typeof User.Type;
