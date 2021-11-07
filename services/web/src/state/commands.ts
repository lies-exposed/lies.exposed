import { command } from "avenger";
import * as TE from "fp-ts/lib/TaskEither";
import { stateLogger } from "../utils/logger.utils";
import { toKey } from "../utils/state.utils";
import {
  IL_DEATH_KEY_PREFIX,
  IL_EVENT_KEY_PREFIX,
  infiniteEventList,
  InfiniteEventListParams,
  infiniteListCache,
  deathsInfiniteList,
} from "./queries";
import { doUpdateCurrentView } from "utils/location.utils";

export const resetInfiniteList = command(
  (filters: InfiniteEventListParams) => {
    return doUpdateCurrentView({ view: "events", ...filters });
  },
  {
    eventList: infiniteEventList,
    deathList: deathsInfiniteList,
  }
);
