import { toEventNetworkDatum } from "@liexp/shared/lib/helpers/event/eventNetworkDatum.helper.js";
import {
  type EventNetworkDatum,
  type NetworkNode,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import { type Events } from "@liexp/shared/lib/io/http/index.js";

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
