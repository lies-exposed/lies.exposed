import { AdminCreate, AdminDelete, AdminEdit } from "../io/http/User.js";
import { type User } from "../io/http/index.js";

export const checkIsAdmin = (pp: readonly User.UserPermission[]): boolean => {
  return (
    pp &&
    [AdminDelete.Type, AdminEdit.Type, AdminCreate.Type].some((p) =>
      pp.includes(p),
    )
  );
};
