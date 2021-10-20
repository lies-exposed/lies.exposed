import { GetEventsQueryFilter } from "@io/http/Events/Uncategorized";
import { command } from "avenger";
import * as TE from "fp-ts/lib/TaskEither";
import { infiniteEventList } from "./queries";
import { toKey } from "utils/state.utils";

export const resetInfiniteList = command(
  ({ _start, _end, ...query }: GetEventsQueryFilter) => {
    const key = toKey(query);
    return TE.fromIO(() => window.localStorage.removeItem(key));
  },
  {
    infiniteEventList,
  }
);
