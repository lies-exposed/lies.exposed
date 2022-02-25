import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "./UUID";

export const BaseProps = t.strict(
  {
    id: UUID,
    // type: t.string,
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  },
  "BaseProps"
);

export type BaseProps = t.TypeOf<typeof BaseProps>;
