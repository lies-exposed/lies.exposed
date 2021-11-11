import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { BaseProps } from "../Common/BaseProps";
import { ByGroupOrActor } from "../Common/ByGroupOrActor";

export const Condamned = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    type: t.literal("Condamned"),
    who: ByGroupOrActor,
    date: DateFromISOString,
  },
  "Condamned"
);

export type Condamned = t.TypeOf<typeof Condamned>;
