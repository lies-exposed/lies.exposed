import * as t from "io-ts";
import { URL } from "../../Common/URL";

export const CreateEventLink = t.strict(
  {
    url: URL,
    description: t.string,
  },
  "CreateEventLink"
);
export type CreateEventLink = t.TypeOf<typeof CreateEventLink>;

export const EventLink = t.strict(
  {
    id: t.string,
    ...CreateEventLink.type.props,
  },
  "EventLink"
);

export type EventLink = t.TypeOf<typeof EventLink>;
