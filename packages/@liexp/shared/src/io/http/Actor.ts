import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { BaseProps } from "./Common/BaseProps";
import { Color } from "./Common/Color";
import { GetListQuery } from "./Query";

export const ACTORS = t.literal("actors");
export type ACTORS = t.TypeOf<typeof ACTORS>;

export const GetListActorQueryFilter = t.partial({
  ids: optionFromNullable(t.array(t.string)),
  fullName: optionFromNullable(t.string),
});

export type GetListActorQueryFilter = t.TypeOf<typeof GetListActorQueryFilter>;

export const GetListActorQuery = t.type(
  {
    ...GetListQuery.props,
    ...GetListActorQueryFilter.props,
  },
  "GetListActorQuery",
);
export type GetListActorQuery = t.TypeOf<typeof GetListActorQuery>;

export const AddActorBody = t.strict(
  {
    username: t.string,
    fullName: t.string,
    color: t.string,
    body: t.UnknownRecord,
    excerpt: t.UnknownRecord,
    avatar: t.union([t.undefined, t.string]),
    bornOn: t.union([DateFromISOString, t.undefined]),
    diedOn: t.union([DateFromISOString, t.undefined]),
  },
  "AddActorBody",
);

export type AddActorBody = t.TypeOf<typeof AddActorBody>;

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
    bornOn: t.union([DateFromISOString, t.undefined]),
    diedOn: t.union([DateFromISOString, t.undefined]),
  },
  "Actor",
);

export type Actor = t.TypeOf<typeof Actor>;
