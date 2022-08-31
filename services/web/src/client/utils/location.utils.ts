import * as io from "@liexp/shared/io";
import React from "react";
import { queryToHash, useNavigateTo } from "./history.utils";

interface CommonViewArgs {
  tab?: number;
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
  areas: NavigateToResource;
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
          case "areas":
          case "articles":
          case "events":
          case "actors":
          case "keywords":
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
      areas: navigateToResource("areas"),
    };
  }, [n.pathname]);
}
