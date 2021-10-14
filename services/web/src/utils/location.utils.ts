import {
  getCurrentView,
  getDoUpdateCurrentView,
  HistoryLocation,
} from "avenger/lib/browser";
import * as qs from "query-string";

export interface ActorsView {
  view: "actors";
}

export interface ActorView {
  view: "actor";
  actorId: string;
}

export interface GroupsView {
  view: "groups";
}

export interface GroupView {
  view: "group";
  groupId: string;
}

export interface EventsView {
  view: "events";
  actors?: string[];
  groups?: string[];
  groupsMembers?: string[];
  keywords?: string[];
  startDate?: string;
  endDate?: string;
  tab?: number;
}

export interface EventView {
  view: "event";
  eventId: string;
}

export interface KeywordsView {
  view: "keywords";
}

export interface KeywordView {
  view: "keyword";
  keywordId: string;
}

export interface IndexView {
  view: "index";
}

export type CurrentView =
  | ActorsView
  | ActorView
  | GroupsView
  | GroupView
  | EventsView
  | EventView
  | KeywordsView
  | KeywordView
  | IndexView;

const actorsRegex = /^\/actors\/$/;
const actorRegex = /^\/actors\/([^/]+)$/;
const groupsRegex = /^\/groups\/$/;
const groupRegex = /^\/groups\/([^/]+)$/;
const eventsRegex = /^\/events\/$/;
const eventRegex = /^\/events\/([^/]+)$/;
const keywordsRegex = /^\/keywords\/$/;
const keywordRegex = /^\/events\/([^/]+)$/;

const parseQuery = (s: string): qs.ParsedQuery =>
  qs.parse(s.replace("?", ""), { arrayFormat: "comma" });

const stringifyQuery = (search: { [key: string]: string | string[] }): string =>
  qs.stringify(search, { arrayFormat: "comma" });

export function locationToView(location: HistoryLocation): CurrentView {
  const actorMatch = location.pathname.match(actorRegex);
  if (actorMatch !== null) {
    return {
      view: "actor",
      actorId: actorMatch[1],
      ...location.search,
    };
  }

  const actorsViewMatch = location.pathname.match(actorsRegex);

  if (actorsViewMatch !== null) {
    return {
      view: "actors",
      ...location.search,
    };
  }

  const groupMatch = location.pathname.match(groupRegex);
  if (groupMatch !== null) {
    return {
      view: "group",
      groupId: groupMatch[1],
      ...location.search,
    };
  }

  const groupsViewMatch = location.pathname.match(groupsRegex);

  if (groupsViewMatch !== null) {
    return {
      view: "groups",
      ...location.search,
    };
  }

  const eventMatch = location.pathname.match(eventRegex);
  if (eventMatch !== null) {
    return {
      view: "event",
      eventId: eventMatch[1],
      ...location.search,
    };
  }

  const eventsViewMatch = location.pathname.match(eventsRegex);

  if (eventsViewMatch !== null) {
    const query = JSON.stringify(location.search);
    return {
      view: "events",
      ...location.search,
      tab: parseInt(location.search.tab ?? "0", 10),
    };
  }

  const keywordsViewMatch = location.pathname.match(keywordsRegex);
  if (keywordsViewMatch !== null) {
    return {
      view: "keywords",
    };
  }

  return { view: "index" };
}

export function viewToLocation(view: CurrentView): HistoryLocation {
  switch (view.view) {
    case "actors":
      return {
        pathname: "/actors/",
        search: {},
      };
    case "actor":
      return {
        pathname: `/actors/${view.actorId}`,
        search: {},
      };
    case "groups":
      return {
        pathname: "/groups/",
        search: {},
      };
    case "group":
      return {
        pathname: `/groups/${view.groupId}`,
        search: {},
      };
    case "events":
      return {
        pathname: `/events/`,
        search: {
          actors: view.actors as any,
          groups: view.groups as any,
          groupsMembers: view.groupsMembers as any,
          keywords: view.keywords as any,
          startDate: view.startDate,
          endDate: view.endDate,
          tab: view.tab?.toString(),
        },
      };
    case "event":
      return { pathname: `/events/${view.eventId}`, search: {} };
    case "keywords":
      return { pathname: `/keywords/`, search: {} };
    case "keyword":
      return { pathname: `/keywords/${view.keywordId}`, search: {} };
    case "index":
      return { pathname: "/index.html", search: {} };
  }
}

export const currentView = getCurrentView(locationToView); // ObservableQuery
export const doUpdateCurrentView = getDoUpdateCurrentView(viewToLocation); // Command
