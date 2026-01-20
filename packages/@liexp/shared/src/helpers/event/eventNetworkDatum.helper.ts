import { type EventNetworkDatum } from "@liexp/io/lib/http/Network/Network.js";
import { type Events } from "@liexp/io/lib/http/index.js";
import { SearchEventHelper } from "./searchEvent.helper.js";

export const toEventNetworkDatum = (
  event: Events.SearchEvent.SearchEvent,
): EventNetworkDatum => {
  const title = SearchEventHelper.getTitle(event);
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
