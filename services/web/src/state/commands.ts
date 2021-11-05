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
} from "./queries";
import {} from "../containers/InfiniteEventList";

// export const resetInfiniteList = command(
//   ({ hash = "", ...query }: InfiniteEventListParams) => {
//     return TE.fromIO(() => {
//       const deathListCacheKey = toKey(IL_DEATH_KEY_PREFIX, hash);
//       stateLogger.debug.log(`[%s] Remove death cache `, deathListCacheKey);
//       delete infiniteListCache[deathListCacheKey];
//       const eventListCacheKey = toKey(IL_EVENT_KEY_PREFIX, hash);
//       stateLogger.debug.log(`[%s] Remove events cache `, deathListCacheKey);
//       delete infiniteListCache[eventListCacheKey];
//     });
//   },
//   {
//     infiniteEventList,
//   }
// );
