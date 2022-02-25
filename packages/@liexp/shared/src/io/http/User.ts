import * as t from "io-ts";
import { BaseProps } from "./Common/BaseProps";

export const User = t.strict(
  {
    ...BaseProps.type.props,
    firstName: t.string,
    lastName: t.string,
    username: t.string,
    email: t.string,
    createdAt: t.string,
    updatedAt: t.string,
  },
  "User"
);
export type User = t.TypeOf<typeof User>;
