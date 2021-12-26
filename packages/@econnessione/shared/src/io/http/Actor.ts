import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { BaseProps } from "./Common/BaseProps";
import { Color } from "./Common/Color";

export const GetListActorQueryFilter = t.partial({
  ids: optionFromNullable(t.array(t.string)),
  fullName: optionFromNullable(t.string),
});

export type GetListActorQueryFilter = t.TypeOf<typeof GetListActorQueryFilter>;

export const Actor = t.strict(
  {
    ...BaseProps.type.props,
    fullName: t.string,
    username: t.string,
    avatar: t.union([t.undefined, t.string]),
    color: Color,
    memberIn: t.array(t.string),
    death: t.union([t.undefined, t.string]),
    excerpt: t.union([t.UnknownRecord, t.null]),
    body: t.union([t.UnknownRecord, t.null]),
  },
  "Actor"
);

export type Actor = t.TypeOf<typeof Actor>;
