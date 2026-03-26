import { EventType } from "@liexp/io/lib/http/Events/index.js";
import * as Match from "effect/Match";

export const EventTypeMatch = Match.value(EventType);
