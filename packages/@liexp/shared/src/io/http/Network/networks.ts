import { type Actor } from "../Actor";
import { type SearchEvent } from "../Events/SearchEvents/SearchEvent";
import { type Group } from "../Group";
import { type Keyword } from "../Keyword";

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
