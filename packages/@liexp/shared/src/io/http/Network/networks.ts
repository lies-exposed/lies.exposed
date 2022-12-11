import { Actor } from '../Actor';
import { SearchEvent } from '../Events/SearchEvent';
import { Group } from '../Group';
import { Keyword } from '../Keyword';

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
  selected: boolean;
};