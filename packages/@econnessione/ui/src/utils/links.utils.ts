import * as io from "@econnessione/shared/io/index";
import { NavigateFn } from "@reach/router";

export const getAdminLink = <K extends io.http.ResourcesNames>(
  key: K,
  f: { id: string }
): string => {
  switch (key) {
    case "articles":
    case "projects":
    case "events":
    case "topics":
    case "actors":
    case "groups": {
      return `/admin/#/collections/${key}/entries/${f.id}`;
    }
    default:
      return "/admin/#/";
  }
};

export const navigateTo = async <K extends io.http.ResourcesNames>(
  nav: NavigateFn,
  resourceName: K,
  f: { id: string }
): Promise<void> => {
  switch (resourceName) {
    case `articles`:
    case "events":
    case "actors":
    case "topics":
    case "projects":
    case "groups": {
      await nav(`/${resourceName}/${f.id}`);
      break;
    }
    default:
      await Promise.resolve(undefined);
  }
};
