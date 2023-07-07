import { type User } from "../io/http";
import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
} from "../io/http/User";

export const checkIsAdmin = (pp: User.UserPermission[]): boolean => {
  return pp && [AdminDelete.value, AdminEdit.value, AdminCreate.value].some((p) =>
    pp.includes(p)
  );
};
