import { type EventNetworkDatum } from "../../io/http/Network/Network.js";
import { type Events } from "../../io/http/index.js";
import { getTitleForSearchEvent } from "./getTitle.helper.js";

export const toEventNetworkDatum = (
  event: Events.SearchEvent.SearchEvent,
): EventNetworkDatum => {
  const title = getTitleForSearchEvent(event);
  return {
    id: event.id,
    label: title,
    title,
    innerColor: "transparent",
    outerColor: "transparent",
    date: event.date,
    groupBy: [],
    type: event.type,
    image: event.media.find((m) => m)?.thumbnail,
    actors: [],
    groups: [],
    keywords: [],
    selected: false,
  };
};
