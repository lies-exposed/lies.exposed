import { type NetworkType } from "@liexp/shared/io/http/Network";
import * as React from "react";
import { type GetListParams } from "react-admin";
import { useActorsQuery } from "../../state/queries/actor.queries";
import {
  EventsNetworkGraphBoxWithQuery,
  type EventNetworkGraphBoxProps,
} from "./EventNetworkGraphBox";

export interface ActorEventNetworkGraphBoxProps
  extends Omit<EventNetworkGraphBoxProps, "id"> {
  type: NetworkType;
  params: Partial<GetListParams>;
}

export const ActorEventNetworkGraphBox: React.FC<
  ActorEventNetworkGraphBoxProps
> = ({ query, ...props }) => {
  return (
    <EventsNetworkGraphBoxWithQuery
      {...props}
      useQuery={useActorsQuery}
      eventsBoxQuery={query}
    />
  );
};
