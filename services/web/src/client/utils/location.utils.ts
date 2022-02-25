import { Buffer } from "buffer";
import * as io from "@liexp/shared/io";
import { available, queryStrict } from "avenger";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import qs from "query-string";
import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { queryToHash, useNavigateTo } from "./history.utils";

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

export function useQueryHash(
  query: Omit<EventsView, "view">
): string | undefined {
  return React.useMemo(
    () => (!isEventsQueryEmpty(query) ? queryToHash(query) : undefined),
    [query]
  );
}

type NavigateToResource = (f: { id?: string }, search?: any) => void;

interface NavigationHooks {
  index: NavigateToResource;
  actors: NavigateToResource;
  events: NavigateToResource;
  groups: NavigateToResource;
  keywords: NavigateToResource;
}

export function useNavigateToResource(): NavigationHooks {
  const n = useNavigateTo();

  return React.useMemo(() => {
    const navigateToResource =
      <K extends io.http.ResourcesNames>(resourceName: K) =>
      (f: { id?: string }, search?: any): void => {
        switch (resourceName) {
          case "index":
            n.navigateTo("/");
            break;
          case `articles`:
          case "events":
          case "actors":
          case "topics":
          case "projects":
          case "groups": {
            const id = f.id ? `/${f.id}` : "";
            n.navigateTo(`/${resourceName}${id}`, search);
            break;
          }
          default:
            break;
        }
      };

    return {
      index: navigateToResource("index"),
      actors: navigateToResource("actors"),
      events: navigateToResource("events"),
      groups: navigateToResource("groups"),
      keywords: navigateToResource("keywords"),
    };
  }, [n.location]);
}
