import { command } from "avenger";
import { doUpdateCurrentView } from "../utils/location.utils";
import {
  deathsPaginated,
  eventsPaginated,
  InfiniteEventListParams,
  scientificStudiesPaginated,
} from "./queries";

export const resetInfiniteList = command(
  (filters: InfiniteEventListParams) => {
    return doUpdateCurrentView({ view: "events", ...filters });
  },
  {
    eventsPaginated,
    deathsPaginated,
    scientificStudiesPaginated,
  }
);
