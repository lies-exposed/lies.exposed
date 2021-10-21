import { GetEventsQueryFilter } from "@io/http/Events/Uncategorized";
import { command } from "avenger";
import * as TE from "fp-ts/lib/TaskEither";
import { stateLogger } from "../utils/logger.utils";
import { toKey } from "../utils/state.utils";
import { infiniteEventList, InfiniteEventListParams } from "./queries";
import {} from "../containers/InfiniteEventList";

export const resetInfiniteList = command(
  ({ hash = "", ...query }: InfiniteEventListParams) => {
    stateLogger.debug.log(`Created key (%s) for payload %O`, hash, query);
    return TE.fromIO(() => window.localStorage.removeItem(hash));
  },
  {
    infiniteEventList,
  }
);
