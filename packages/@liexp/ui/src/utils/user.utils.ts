import { User } from "@liexp/shared/io/http";
import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
} from "@liexp/shared/io/http/User";

export const checkIsAdmin = (pp: User.UserPermission[]): boolean => {
  return [AdminDelete.value, AdminEdit.value, AdminCreate.value].some((p) =>
    pp.includes(p)
  );
};
