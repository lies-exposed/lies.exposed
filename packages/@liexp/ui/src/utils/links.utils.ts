import * as io from "@liexp/shared/io/index";
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
      return `${process.env.ADMIN_URL}/index.html?#/${key}/${f.id}`;
    }
    default:
      return `${process.env.ADMIN_URL}/index.html`;
  }
};

export const getProfileLink = (
  key: io.http.ResourcesNames,
  f: { id: string }
): string => {
  switch (key) {
    case "events/suggestions": {
      return `/profile/${key}/${f.id}`;
    }
    default:
      return `/profile`;
  }
};

export const navigateTo = async <K extends io.http.ResourcesNames>(
  nav: NavigateFn,
  resourceName: K,
  f: { path?: string; id: string }
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
    case "profile": {
      await nav(`/profile/${f.path}/${f.id}`);
      break;
    }
    default:
      await Promise.resolve(undefined);
  }
};

export const navigateToProfile = async (
  nav: NavigateFn,
  resourceName: io.http.ResourcesNames,
  f: { id: string }
): Promise<void> => {
  switch (resourceName) {
    case "events/suggestions": {
      await nav(`/profile/${resourceName}/${f.id}`);
      break;
    }
    default:
      await Promise.resolve(undefined);
  }
};
