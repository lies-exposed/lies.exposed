import {
  getCurrentView,
  getDoUpdateCurrentView,
  HistoryLocation,
} from "avenger/lib/browser";
import * as qs from "query-string";

export interface BlogView {
  view: "blog";
}

export interface ArticleView {
  view: "article";
  articlePath: string;
}

export interface DocsView {
  view: "docs";
}

export interface AboutView {
  view: "about";
}

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

export interface VaccineDashboardView {
  view: "vaccines-dashboard";
  adrTab?: number;
}

export interface IndexView {
  view: "index";
}

export type CurrentView =
  | BlogView
  | ArticleView
  | DocsView
  | AboutView
  | ActorsView
  | ActorView
  | GroupsView
  | GroupView
  | EventsView
  | EventView
  | KeywordsView
  | KeywordView
  | VaccineDashboardView
  | IndexView;


const blogRegex = /^\/blog\/$/;
const articleRegex = /^\/blog\/([^/]+)$/;
const docsRegex = /^\/docs\/$/;
const aboutRegex = /^\/about\/$/;
const actorsRegex = /^\/dashboard\/actors\/$/;
const actorRegex = /^\/dashboard\/actors\/([^/]+)$/;
const groupsRegex = /^\/dashboard\/groups\/$/;
const groupRegex = /^\/dashboard\/groups\/([^/]+)$/;
const keywordsRegex = /^\/dashboard\/keywords\/$/;
const keywordRegex = /^\/dashboard\/keywords\/([^/]+)$/;
const eventsRegex = /^\/dashboard\/events\/$/;
const eventRegex = /^\/dashboard\/events\/([^/]+)$/;
const vaccinesDashboardRegex = /^\/dashboard\/vaccines\/$/;

const parseQuery = (s: string): qs.ParsedQuery =>
  qs.parse(s.replace("?", ""), { arrayFormat: "comma" });

const stringifyQuery = (search: { [key: string]: string | string[] }): string =>
  qs.stringify(search, { arrayFormat: "comma" });

export function locationToView(location: HistoryLocation): CurrentView {
  const { path: currentPath = "", ...search } = location.search;
  const blogMatch = currentPath.match(blogRegex);
  if (blogMatch !== null) {
    return {
      view: "blog",
      ...search,
    };
  }

  const articleMatch = currentPath.match(articleRegex);
  if (articleMatch !== null) {
    return {
      view: "article",
      articlePath: articleMatch[1],
      ...search,
    };
  }

  const docsMatch = currentPath.match(docsRegex);
  if (docsMatch !== null) {
    return {
      view: "docs",
      ...search,
    };
  }

  const aboutMatch = currentPath.match(aboutRegex);
  if (aboutMatch !== null) {
    return {
      view: "about",
      ...search,
    };
  }

  const actorMatch = currentPath.match(actorRegex);
  if (actorMatch !== null) {
    return {
      view: "actor",
      actorId: actorMatch[1],
      ...search,
    };
  }

  const actorsViewMatch = currentPath.match(actorsRegex);

  if (actorsViewMatch !== null) {
    return {
      view: "actors",
      ...search,
    };
  }

  const groupMatch = currentPath.match(groupRegex);
  if (groupMatch !== null) {
    return {
      view: "group",
      groupId: groupMatch[1],
      ...search,
    };
  }

  const groupsViewMatch = currentPath.match(groupsRegex);

  if (groupsViewMatch !== null) {
    return {
      view: "groups",
      ...search,
    };
  }

  const eventMatch = currentPath.match(eventRegex);
  if (eventMatch !== null) {
    return {
      view: "event",
      eventId: eventMatch[1],
      ...search,
    };
  }

  const eventsViewMatch = currentPath.match(eventsRegex);

  if (eventsViewMatch !== null) {
    return {
      view: "events",
      ...search,
      tab: parseInt(location.search.tab ?? "0", 10),
    };
  }

  const keywordsViewMatch = currentPath.match(keywordsRegex);
  if (keywordsViewMatch !== null) {
    return {
      view: "keywords",
    };
  }

  const keywordViewMatch = currentPath.match(keywordRegex);
  if (keywordViewMatch !== null) {
    return {
      view: "keyword",
      keywordId: keywordViewMatch[1],
    };
  }

  const vaccineDashboardMatch = currentPath.match(vaccinesDashboardRegex);
  if (vaccineDashboardMatch !== null) {
    return {
      view: "vaccines-dashboard",
      ...search,
      adrTab: parseInt(location.search.adrTab ?? "0", 10),
    };
  }

  return { view: "index" };
}

export function viewToLocation(view: CurrentView): HistoryLocation {
  switch (view.view) {
    case "blog":
      return {
        pathname: "index.html",
        search: {
          path: "/blog/",
        },
      };
    case "article":
      return {
        pathname: "index.html",
        search: {
          path: `/blog/${view.articlePath}`,
        },
      };
    case "docs":
      return {
        pathname: `index.html`,
        search: {
          path: `/docs/`,
        },
      };
    case "about":
      return {
        pathname: `index.html`,
        search: { path: "/about/" },
      };
    case "actors":
      return {
        pathname: "index.html",
        search: {
          path: "/dashboard/actors/",
        },
      };
    case "actor":
      return {
        pathname: "index.html",
        search: {
          path: `/dashboard/actors/${view.actorId}`,
        },
      };
    case "groups":
      return {
        pathname: "index.html",
        search: {
          path: "/dashboard/groups/",
        },
      };
    case "group":
      return {
        pathname: "index.html",
        search: {
          path: `/dashboard/groups/${view.groupId}`,
        },
      };
    case "events":
      return {
        pathname: "index.html",
        search: {
          path: `/dashboard/events/`,
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
      return {
        pathname: "index.html",
        search: {
          path: `/dashboard/events/${view.eventId}`,
        },
      };
    case "keywords":
      return {
        pathname: "index.html",
        search: {
          path: `/keywords/`,
        },
      };
    case "keyword":
      return {
        pathname: `index.html`,
        search: {
          path: `/keywords/${view.keywordId}`,
        },
      };

    case "vaccines-dashboard":
      return {
        pathname: "index.html",
        search: {
          path: `/dashboard/vaccines/`,
          adrTab: view.adrTab?.toString(),
        },
      };
    case "index":
      return { pathname: "/index.html", search: {} };
  }
}

export const currentView = getCurrentView(locationToView); // ObservableQuery
export const doUpdateCurrentView = getDoUpdateCurrentView(viewToLocation); // Command
