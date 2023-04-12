import { type Events } from "@liexp/shared/lib/io/http";
import type { GetOneParams } from "react-admin";
import { useQuery } from "react-query";
import { Queries } from "../../providers/DataProvider";
import { type UseQueryFn } from "./type";

export const getEventQueryKey = (p: GetOneParams): [string, GetOneParams] => [
  "event",
  {
    ...p,
  },
];

export const fetchEvent = async ({ queryKey }: any): Promise<Events.Event> =>
  await Queries.Event.get(queryKey[1]);

export const useEventQuery: UseQueryFn<GetOneParams, Events.Event> = (
  params
) => {
  return useQuery(getEventQueryKey(params), fetchEvent);
};
