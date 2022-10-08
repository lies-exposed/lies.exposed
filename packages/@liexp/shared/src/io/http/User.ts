import * as t from "io-ts";
import { BaseProps } from "./Common/BaseProps";

const EventSuggestionCreate = t.literal("event-suggestion:create");
const EventSuggestionRead = t.literal("event-suggestion:read");
const EventSuggestionEdit = t.literal("event-suggestion:create");
const AdminRead = t.literal("admin:read");
const AdminCreate = t.literal("admin:create");
const AdminEdit = t.literal("admin:edit");
const AdminDelete = t.literal("admin:delete");

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
