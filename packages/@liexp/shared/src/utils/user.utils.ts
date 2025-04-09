import { AdminCreate, AdminDelete, AdminEdit } from "../io/http/User.js";
import { type User } from "../io/http/index.js";

export const checkIsAdmin = (pp: readonly User.UserPermission[]): boolean => {
  return (
    pp &&
    [
      AdminDelete.literals[0],
      AdminEdit.literals[0],
      AdminCreate.literals[0],
    ].some((p) => pp.includes(p))
  );
};
