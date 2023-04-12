import { type NetworkType } from "@liexp/shared/lib/io/http/Network";
import * as React from "react";
import { type GetListParams } from "react-admin";
import { useGroupsQuery } from "../../state/queries/groups.queries";
import {
  EventsNetworkGraphBoxWithQuery,
  type EventNetworkGraphBoxProps,
} from "./EventNetworkGraphBox";

export interface GroupEventNetworkGraphBoxProps
  extends Omit<EventNetworkGraphBoxProps, "id"> {
  type: NetworkType;
  params: Partial<GetListParams>;
}

export const GroupEventNetworkGraphBox: React.FC<
  GroupEventNetworkGraphBoxProps
> = ({ query, ...props }) => {
  return (
    <EventsNetworkGraphBoxWithQuery
      {...props}
      useQuery={useGroupsQuery}
      eventsBoxQuery={query}
    />
  );
};
