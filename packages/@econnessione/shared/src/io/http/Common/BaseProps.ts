import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";

export const BaseProps = t.strict(
  {
    id: t.string,
    // type: t.string,
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  },
  "BaseProps"
);

export type BaseProps = t.TypeOf<typeof BaseProps>;
