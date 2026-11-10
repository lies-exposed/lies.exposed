import { useNavigateTo } from "@liexp/ui/lib/utils/history.utils.js";
import * as React from "react";

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
  _start?: number;
  _end?: number;
}

// const isEventsQueryEmpty = (v: Omit<EventsView, "view">): boolean => {
//   return (
//     (v.actors ?? []).length === 0 &&
//     (v.groups ?? []).length === 0 &&
//     (v.groupsMembers ?? []).length === 0 &&
//     (v.keywords ?? []).length === 0 &&
//     v.startDate === undefined &&
//     v.endDate === undefined &&
//     (v.tab ?? 0) === 0
//   );
// };

// export function useQueryHash(
//   query: Omit<EventsView, "view">,
// ): string | undefined {
//   return React.useMemo(
//     () => (!isEventsQueryEmpty(query) ? queryToHash(query) : undefined),
//     [query],
//   );
// }

type NavigateToResource = (
  f: { id?: string },
  search?: Record<string, string | string[]>,
) => void;

interface NavigationHooks {
  index: NavigateToResource;
  actors: NavigateToResource;
  areas: NavigateToResource;
  events: NavigateToResource;
  groups: NavigateToResource;
  keywords: NavigateToResource;
  media: NavigateToResource;
  links: NavigateToResource;
  stories: (
    f: { path?: string },
    search?: Record<string, string | string[]>,
  ) => void;
}

export function useNavigateToResource(): NavigationHooks {
  const n = useNavigateTo();

  return React.useMemo(() => {
    const navigateToResource =
      <K extends keyof NavigationHooks>(resourceName: K) =>
      (
        f: Record<string, string | string[]>,
        search?: Record<string, string | string[]>,
      ): void => {
        switch (resourceName) {
          case "index":
            n.navigateTo("/");
            break;
          case "stories": {
            const path = (f as { path?: string }).path
              ? `/${(f as { path?: string }).path}`
              : "";
            n.navigateTo(
              `/${resourceName}${path}`,
              search as Record<string, string | string[]>,
            );
            break;
          }
          case "media":
          case "areas":
          case "events":
          case "actors":
          case "keywords":
          case "links":
          case "groups": {
            const id = (f as { id?: string }).id
              ? `/${(f as { id?: string }).id}`
              : "";
            n.navigateTo(
              `/${resourceName}${id}`,
              search as Record<string, string | string[]>,
            );
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
      media: navigateToResource("media"),
      stories: navigateToResource("stories"),
      links: navigateToResource("links"),
    };
  }, [n.pathname, n.search]);
}
