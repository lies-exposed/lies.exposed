import { APIError } from "@econnessione/shared/providers/api.provider";
import { command } from "avenger";
import * as TE from "fp-ts/lib/TaskEither";
import { doUpdateCurrentView } from "../utils/location.utils";
import { eventsPaginated, InfiniteEventListParams } from "./queries";

export const resetInfiniteList: (
  input: InfiniteEventListParams,
  ia: {} & { eventsPaginated: InfiniteEventListParams }
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => TE.TaskEither<APIError | void, void> = command(
  (filters: InfiniteEventListParams) => {
    return doUpdateCurrentView({ view: "events", ...filters });
  },
  {
    eventsPaginated,
  }
);
