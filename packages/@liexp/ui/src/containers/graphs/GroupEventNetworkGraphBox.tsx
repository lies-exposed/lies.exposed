import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { type EndpointQueryType } from "@ts-endpoint/core";
import * as React from "react";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import {
  EventsNetworkGraphBoxWithQuery,
  type EventNetworkGraphBoxProps,
} from "./EventsNetworkGraphBox/EventsNetworkGraphBox.js";

export interface GroupEventNetworkGraphBoxProps
  extends Omit<EventNetworkGraphBoxProps, "id" | "type"> {
  params: Partial<EndpointQueryType<typeof Endpoints.Networks.Get>>;
}

export const GroupEventNetworkGraphBox: React.FC<
  GroupEventNetworkGraphBoxProps
> = ({ query, params, ...props }) => {
  const Queries = useEndpointQueries();
  return (
    <EventsNetworkGraphBoxWithQuery<typeof params>
      {...props}
      type={GROUPS.literals[0]}
      params={params}
      useQuery={(p, q) =>
        Queries.Networks.get.useQuery({ type: "groups" }, q, true)
      }
      eventsBoxQuery={query}
    />
  );
};
