import { type fc } from "@liexp/test";
import { BOOK, DEATH } from "../../../io/http/Events/EventType.js";
import { type EventType } from "../../../io/http/Events/index.js";
import { type Events } from "../../../io/http/index.js";
import { BookEventArb } from "./BookEvent.arbitrary.js";
import { DeathEventArb } from "./DeathEvent.arbitrary.js";
import { UncategorizedArb } from "./Uncategorized.arbitrary.js";

export const getEventArbitrary = (
  type: EventType,
): fc.Arbitrary<Events.Event> => {
  if (BOOK.is(type)) {
    return BookEventArb;
  }
  if (DEATH.is(type)) {
    return DeathEventArb;
  }
  return UncategorizedArb;
};
