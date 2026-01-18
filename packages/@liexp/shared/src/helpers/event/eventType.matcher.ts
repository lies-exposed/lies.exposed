import * as Match from "effect/Match";
import { EventType } from "../../io/http/Events";

export const EventTypeMatch = Match.value(EventType);
