import { EventType } from "@liexp/io/lib/http/Events";
import * as Match from "effect/Match";

export const EventTypeMatch = Match.value(EventType);
