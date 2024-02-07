import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as t from "io-ts";
import { BaseProps } from "./Common/BaseProps.js";

export const EventSuggestionCreate = t.literal("event-suggestion:create");
export const EventSuggestionRead = t.literal("event-suggestion:read");
export const EventSuggestionEdit = t.literal("event-suggestion:create");
export const AdminRead = t.literal("admin:read");
export const AdminCreate = t.literal("admin:create");
export const AdminEdit = t.literal("admin:edit");
export const AdminDelete = t.literal("admin:delete");

export const UserPermission = t.union(
  [
    EventSuggestionCreate,
    EventSuggestionRead,
    EventSuggestionEdit,
    AdminRead,
    AdminCreate,
    AdminEdit,
    AdminDelete,
  ],
  "UserPermission",
);
export type UserPermission = t.TypeOf<typeof UserPermission>;

export const UserStatusPending = t.literal("Pending");
export const UserStatusApproved = t.literal("Approved");
export const UserStatusDeclined = t.literal("Declined");
export const UserStatus = t.union(
  [UserStatusPending, UserStatusApproved, UserStatusDeclined],
  "UserStatus",
);
export type UserStatus = t.TypeOf<typeof UserStatus>;

export const SignUpUserBody = t.strict(
  {
    username: t.string,
    firstName: t.string,
    lastName: t.string,
    email: t.string,
    password: t.string,
  },
  "SignUpUserBody",
);
export type SignUpUserBody = t.TypeOf<typeof SignUpUserBody>;

export const EditUserBody = t.strict(
  {
    ...propsOmit(SignUpUserBody, ["password"]),
    status: UserStatus,
  },
  "EditUserBody",
);
export type EditUserBody = t.TypeOf<typeof EditUserBody>;

export const User = t.strict(
  {
    ...BaseProps.type.props,
    firstName: t.string,
    lastName: t.string,
    username: t.string,
    email: t.string,
    status: UserStatus,
    permissions: t.array(UserPermission),
    telegramId: t.union([t.string, t.null]),
    telegramToken: t.union([t.string, t.null]),
    createdAt: t.string,
    updatedAt: t.string,
  },
  "User",
);
export type User = t.TypeOf<typeof User>;
