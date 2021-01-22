import * as t from "io-ts";
import { URL } from "../../Common/URL";

export const EventLink = t.strict(
  {
    id: t.string,
    url: URL,
    description: t.string,
  },
  'EventLink'
);

export type EventLink = t.TypeOf<typeof EventLink>;
