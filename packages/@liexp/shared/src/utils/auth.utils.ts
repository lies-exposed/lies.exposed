import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
  AdminRead,
  type AuthPermission,
} from "../io/http/auth/permissions/index.js";

export const checkIsAdmin = (pp: readonly AuthPermission[]): boolean => {
  return (
    pp &&
    [
      AdminDelete.literals[0],
      AdminEdit.literals[0],
      AdminCreate.literals[0],
      AdminRead.literals[0],
    ].some((p) => pp.includes(p))
  );
};
