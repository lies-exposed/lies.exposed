import { type NetworkType } from "@liexp/shared/lib/io/http/Network";
import * as React from "react";
import { type GetListParams } from "react-admin";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider";
import {
  EventsNetworkGraphBoxWithQuery,
  type EventNetworkGraphBoxProps,
} from "./EventsNetworkGraphBox";

export interface GroupEventNetworkGraphBoxProps
  extends Omit<EventNetworkGraphBoxProps, "id"> {
  type: NetworkType;
  params: Partial<GetListParams>;
}

export const GroupEventNetworkGraphBox: React.FC<
  GroupEventNetworkGraphBoxProps
> = ({ query, ...props }) => {
  const Queries = useEndpointQueries();
  return (
    <EventsNetworkGraphBoxWithQuery
      {...props}
      useQuery={(p) =>
        Queries.Networks.list.useQuery(p as any, undefined, false)
      }
      eventsBoxQuery={query}
    />
  );
};
