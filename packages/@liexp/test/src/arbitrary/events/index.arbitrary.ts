import {
  BOOK,
  DEATH,
  SCIENTIFIC_STUDY,
} from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { type Events } from "@liexp/shared/lib/io/http/index.js";
import { Schema } from "effect";
import type fc from "fast-check";
import { BookEventArb } from "./BookEvent.arbitrary.js";
import { DeathEventArb } from "./DeathEvent.arbitrary.js";
import { ScientificStudyArb } from "./ScientificStudy.arbitrary.js";
import { UncategorizedArb } from "./Uncategorized.arbitrary.js";

export const getEventArbitrary = (
  type: EventType,
): fc.Arbitrary<Events.Event> => {
  if (Schema.is(BOOK)(type)) {
    return BookEventArb;
  }

  if (Schema.is(DEATH)(type)) {
    return DeathEventArb;
  }

  if (Schema.is(SCIENTIFIC_STUDY)(type)) {
    return ScientificStudyArb;
  }

  return UncategorizedArb;
};
