import * as io from "@econnessione/shared/io";
import { available, queryStrict } from "avenger";
import { Buffer } from "buffer";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import qs from "query-string";
import React from "react";
import { useHistory, useLocation } from "react-router-dom";

interface CommonViewArgs {
  tab?: number;
}

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

export interface ActorView extends CommonViewArgs {
  view: "actor";
  actorId: string;
}

export interface GroupsView {
  view: "groups";
}

export interface GroupView extends CommonViewArgs {
  view: "group";
  groupId: string;
}

export interface EventsView extends CommonViewArgs {
  view: "events";
  actors?: string[];
  groups?: string[];
  groupsMembers?: string[];
  keywords?: string[];
  startDate?: string;
  endDate?: string;
  hash?: string;
  page?: number;
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

// const parseQuery = (s: string): qs.ParsedQuery =>
//   qs.parse(s.replace("?", ""), { arrayFormat: "comma" });

// const stringifyQuery = (search: { [key: string]: string | string[] }): string =>
//   qs.stringify(search, { arrayFormat: "comma" });

const toBase64 = (data: string): string => {
  return Buffer.from(data).toString("base64");
};

const fromBase64 = (hash: string): string => {
  return Buffer.from(hash, "base64").toString();
};

const isEventsQueryEmpty = (v: Omit<EventsView, "view">): boolean => {
  return (
    (v.actors ?? []).length === 0 &&
    (v.groups ?? []).length === 0 &&
    (v.groupsMembers ?? []).length === 0 &&
    (v.keywords ?? []).length === 0 &&
    v.startDate === undefined &&
    v.endDate === undefined &&
    (v.tab ?? 0) === 0
  );
};

export function locationToView(location: any): CurrentView {
  const { path: currentPath = "", hash, ...search } = location.search;
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
      ...search,
      view: "actor",
      actorId: actorMatch[1],
      tab: search.tab !== undefined ? parseInt(search.tab) : undefined,
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
      ...search,
      view: "group",
      groupId: groupMatch[1],
      tab: search.tab !== undefined ? parseInt(search.tab) : undefined,
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
    const decodedSearch = pipe(
      hash !== undefined && hash !== "" ? fromBase64(fromBase64(hash)) : "{}",
      JSON.parse
    );

    return {
      view: "events",
      ...decodedSearch,
      tab: parseInt(decodedSearch.tab ?? "0", 10),
      hash,
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

export function viewToLocation(view: CurrentView): any {
  const pathname =
    process.env.NODE_ENV === "development" ? "/index.html" : "/web/index.html";
  switch (view.view) {
    case "blog":
      return {
        pathname,
        search: {
          path: "/blog/",
        },
      };
    case "article":
      return {
        pathname,
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
        pathname,
        search: {
          path: "/dashboard/actors/",
        },
      };
    case "actor":
      return {
        pathname,
        search: {
          path: `/dashboard/actors/${view.actorId}`,
          tab: view.tab?.toString(),
        },
      };
    case "groups":
      return {
        pathname,
        search: {
          path: "/dashboard/groups/",
        },
      };
    case "group":
      return {
        pathname,
        search: {
          path: `/dashboard/groups/${view.groupId}`,
          tab: view.tab?.toString(),
        },
      };
    // case "events":
    //   // eslint-disable-next-line no-case-declarations
    //   const query = {
    //     actors: view.actors,
    //     groups: view.groups,
    //     groupsMembers: view.groupsMembers,
    //     keywords: view.keywords,
    //     startDate: view.startDate,
    //     endDate: view.endDate,
    //     tab: view.tab,
    //   };

    //   // eslint-disable-next-line no-case-declarations

    //   return {
    //     pathname,
    //     search: {
    //       path: `/dashboard/events/`,
    //       hash,
    //     },
    //   };
    case "event":
      return {
        pathname,
        search: {
          path: `/dashboard/events/${view.eventId}`,
        },
      };
    case "keywords":
      return {
        pathname,
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
        pathname,
        search: {
          path: `/dashboard/vaccines/`,
          adrTab: view.adrTab?.toString(),
        },
      };
    case "index":
      return { pathname, search: {} };
  }
}

// export const currentView = getCurrentView(locationToView); // ObservableQuery
export const currentView = queryStrict<any, any, any>(
  (input) =>
    TE.right({
      view: "events",
    }),
  available
);


type NavigateToResource = (f: { id?: string }, search?: any) => void;

interface NavigationHooks {
  actors: NavigateToResource;
  events: NavigateToResource;
  groups: NavigateToResource;
  keywords: NavigateToResource;
  navigate: (path: string, search?: any) => void;
}

export function useNavigate(): NavigationHooks {
  const h = useHistory();

  const navigateToResource =
    <K extends io.http.ResourcesNames>(resourceName: K) =>
    (f: { id?: string }, search?: any): void => {
      switch (resourceName) {
        case `articles`:
        case "events":
        case "actors":
        case "topics":
        case "projects":
        case "groups": {
          const query = search
            ? "?".concat(qs.stringify(search, { arrayFormat: "comma" }))
            : "";
          const id = f.id ? `/${f.id}` : "";
          h.push(`/${resourceName}${id}${query}`);

          break;
        }
        default:
          break;
      }
    };

  const navigate = (view: string, search?: any): void => {
    const query = qs.stringify(search, { arrayFormat: "comma" });
    h.push(`${view}?${query}`);
  };

  return {
    actors: navigateToResource("actors"),
    events: navigateToResource("events"),
    groups: navigateToResource("groups"),
    keywords: navigateToResource('keywords'),
    navigate,
  };
}

export function useRouteQuery(): qs.ParsedQuery<string> {
  const { search } = useLocation();

  return React.useMemo(
    () => qs.parse(search, { arrayFormat: "comma" }),
    [search]
  );
}

export const queryToHash = (q: any): string => {
  return toBase64(toBase64(JSON.stringify(q)));
};

export const hashToQuery = (h: string): any => {
  return fromBase64(fromBase64(h));
};

export function useQueryHash(
  query: Omit<EventsView, "view">
): string | undefined {
  return React.useMemo(
    () => (!isEventsQueryEmpty(query) ? queryToHash(query) : undefined),
    [query]
  );
}

export function useQueryFromHash(hash: string): any {
  return React.useMemo(
    () =>
      pipe(
        hash !== undefined && hash !== "" ? hashToQuery(hash) : "{}",
        JSON.parse
      ),
    [hash]
  );
}
