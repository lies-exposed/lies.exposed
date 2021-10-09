import {
  getCurrentView,
  getDoUpdateCurrentView,
  HistoryLocation,
} from "avenger/lib/browser";
import * as qs from "query-string";

export interface EventsView {
  view: "events";
  actors?: string[];
  groups?: string[];
  groupsMembers?: string[];
  startDate?: string;
  endDate?: string;
  tab?: number;
}
export interface IndexView {
  view: "index";
}

export type CurrentView = EventsView | IndexView;

const eventsRegex = /^\/events\/$/;

const parseQuery = (s: string): qs.ParsedQuery =>
  qs.parse(s.replace("?", ""), { arrayFormat: "comma" });

const stringifyQuery = (search: { [key: string]: string | string[] }): string =>
  qs.stringify(search, { arrayFormat: "comma" });

export function locationToView(location: HistoryLocation): CurrentView {
  const eventsViewMatch = location.pathname.match(eventsRegex);

  if (eventsViewMatch !== null) {
    const query = JSON.stringify(location.search);
    return {
      view: "events",
      ...location.search,
      tab: parseInt(location.search.tab ?? "0", 10),
    };
  }
  return { view: "events" };
}

export function viewToLocation(view: CurrentView): HistoryLocation {
  switch (view.view) {
    case "events":
      return {
        pathname: `/events/`,
        search: {
          actors: view.actors as any,
          groups: view.groups as any,
          groupsMembers: view.groupsMembers as any,
          startDate: view.startDate,
          endDate: view.endDate,
          tab: view.tab?.toString(),
        },
      };
    case "index":
      return { pathname: "/index.html", search: {} };
  }
}

export const currentView = getCurrentView(locationToView); // ObservableQuery
export const doUpdateCurrentView = getDoUpdateCurrentView(viewToLocation); // Command
