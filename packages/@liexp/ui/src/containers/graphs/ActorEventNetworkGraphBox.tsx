import { type NetworkType } from "@liexp/shared/lib/io/http/Network/Network.js";
import * as React from "react";
import { type GetListParams } from "react-admin";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import {
  EventsNetworkGraphBoxWithQuery,
  type EventNetworkGraphBoxProps,
} from "./EventsNetworkGraphBox/EventsNetworkGraphBox.js";

export interface ActorEventNetworkGraphBoxProps
  extends Omit<EventNetworkGraphBoxProps, "id"> {
  type: NetworkType;
  params: Partial<GetListParams>;
}

export const ActorEventNetworkGraphBox: React.FC<
  ActorEventNetworkGraphBoxProps
> = ({ query, ...props }) => {
  const Queries = useEndpointQueries();
  return (
    <EventsNetworkGraphBoxWithQuery
      {...props}
      useQuery={(p) => Queries.Event.list.useQuery(p, undefined, true)}
      eventsBoxQuery={query}
    />
  );
};
