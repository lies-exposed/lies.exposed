import {
  type EventNetworkDatum,
  type NetworkNode,
} from "@liexp/io/lib/http/Network/Network.js";
import { type Events } from "@liexp/io/lib/http/index.js";
import { toEventNetworkDatum } from "@liexp/shared/lib/helpers/event/eventNetworkDatum.helper.js";

export type EventNetworkNodeProps = NetworkNode<EventNetworkDatum>;

export const toEventNodes = (
  events: Events.SearchEvent.SearchEvent[],
): EventNetworkNodeProps[] => {
  return events.map((event) => {
    return {
      data: toEventNetworkDatum(event),
    };
  });
};
