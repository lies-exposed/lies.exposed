import { type Actor } from "../Actor.js";
import { type SearchEvent } from "../Events/SearchEvents/SearchEvent.js";
import { type Group } from "../Group.js";
import { type Keyword } from "../Keyword.js";

export interface NetworkNodeDatum {
  // x: number;
  // y: number;
  id: string;
  label: string;
  // innerColor: string;
  // outerColor: string;
}

export type GroupByItem = Actor | Group | Keyword;

export type NetworkDatum = NetworkNodeDatum & SearchEvent;

export type EventNetworkDatum = Omit<NetworkDatum, "x" | "y" | "keywords"> & {
  title: string;
  groupBy: GroupByItem[];
  actors: Actor[];
  groups: Group[];
  keywords: Keyword[];
  image: string | undefined;
  selected: boolean;
};
