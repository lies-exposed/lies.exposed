import * as t from "io-ts";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";

export const User = t.strict(
  {
    ...BaseFrontmatter.type.props,
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
