import { command } from "avenger";
import { doUpdateCurrentView } from "../utils/location.utils";
import { eventsPaginated, InfiniteEventListParams } from "./queries";

export const resetInfiniteList = command(
  (filters: InfiniteEventListParams) => {
    return doUpdateCurrentView({ view: "events", ...filters });
  },
  {
    eventsPaginated,
  }
);
