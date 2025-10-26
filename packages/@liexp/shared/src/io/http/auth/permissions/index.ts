import { Schema } from "effect";

export const EventSuggestionCreate = Schema.Literal("event-suggestion:create");
export const EventSuggestionRead = Schema.Literal("event-suggestion:read");
export const EventSuggestionEdit = Schema.Literal("event-suggestion:create");
export const AdminRead = Schema.Literal("admin:read");
export const AdminCreate = Schema.Literal("admin:create");
export const AdminEdit = Schema.Literal("admin:edit");
export const AdminDelete = Schema.Literal("admin:delete");
export const MCPToolsAccess = Schema.Literal("mcp:tools");

export const AuthPermission = Schema.Union(
  EventSuggestionCreate,
  EventSuggestionRead,
  EventSuggestionEdit,
  AdminRead,
  AdminCreate,
  AdminEdit,
  AdminDelete,
  MCPToolsAccess,
).annotations({
  title: "AuthPermission",
});
export type AuthPermission = typeof AuthPermission.Type;
