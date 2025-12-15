import {
  BOOK,
  DEATH,
  DOCUMENTARY,
  SCIENTIFIC_STUDY,
  TRANSACTION,
  QUOTE,
} from "@liexp/shared/lib/io/http/Events/EventType.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { type Events } from "@liexp/shared/lib/io/http/index.js";
import { Arbitrary, Schema } from "effect";
import type fc from "fast-check";
import { BookEventArb } from "./BookEvent.arbitrary.js";
import { DeathEventArb } from "./DeathEvent.arbitrary.js";
import { DocumentaryEventArb } from "./DocumentaryEvent.arbitrary.js";
import { QuoteEventArb } from "./QuoteEvent.arbitrary.js";
import { ScientificStudyArb } from "./ScientificStudy.arbitrary.js";
import { TransactionEventArb } from "./TransactionEvent.arbitrary.js";
import { UncategorizedArb } from "./Uncategorized.arbitrary.js";

export const getEventArbitrary = <E extends EventType>(
  type: E,
): fc.Arbitrary<(typeof Events.EventMap)[E]["Type"]> => {
  if (Schema.is(BOOK)(type)) {
    return BookEventArb;
  }

  if (Schema.is(DEATH)(type)) {
    return DeathEventArb;
  }

  if (Schema.is(SCIENTIFIC_STUDY)(type)) {
    return ScientificStudyArb;
  }

  if (Schema.is(TRANSACTION)(type)) {
    return TransactionEventArb;
  }

  if (Schema.is(DOCUMENTARY)(type)) {
    return DocumentaryEventArb;
  }

  if (Schema.is(QUOTE)(type)) {
    return QuoteEventArb;
  }

  return UncategorizedArb;
};

export const EventTypeArb = Arbitrary.make(EventType);
