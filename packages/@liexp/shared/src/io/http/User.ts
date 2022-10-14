import * as t from "io-ts";
import { BaseProps } from "./Common/BaseProps";

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
  "UserPermission"
);
export type UserPermission = t.TypeOf<typeof UserPermission>;

export const User = t.strict(
  {
    ...BaseProps.type.props,
    firstName: t.string,
    lastName: t.string,
    username: t.string,
    email: t.string,
    permissions: t.array(UserPermission),
    createdAt: t.string,
    updatedAt: t.string,
  },
  "User"
);
export type User = t.TypeOf<typeof User>;
