import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { type EndpointQueryType } from "@ts-endpoint/core";
import * as React from "react";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import {
  EventsNetworkGraphBoxWithQuery,
  type EventNetworkGraphBoxProps,
} from "./EventsNetworkGraphBox/EventsNetworkGraphBox.js";

export interface ActorEventNetworkGraphBoxProps
  extends Omit<EventNetworkGraphBoxProps, "id" | "type"> {
  params: Partial<EndpointQueryType<typeof Endpoints.Networks.Get>>;
}

export const ActorEventNetworkGraphBox: React.FC<
  ActorEventNetworkGraphBoxProps
> = ({ query, params, ...props }) => {
  const Queries = useEndpointQueries();
  return (
    <EventsNetworkGraphBoxWithQuery<typeof params>
      {...props}
      params={params}
      type={ACTORS.literals[0]}
      useQuery={(p, q) => Queries.Networks.get.useQuery(p, q, true)}
      eventsBoxQuery={query}
    />
  );
};
