import type * as io from "@liexp/shared/lib/io/index.js";
import { type NavigateFunction } from "react-router";
import { type Configuration } from "../context/ConfigurationContext.js";

export const getAdminLink =
  (conf: Configuration) =>
  <K extends io.http.ResourcesNames>(key: K, f: { id: string }): string => {
    switch (key) {
      case "stories":
      case "projects":
      case "events":
      case "keywords":
      case "actors":
      case "media":
      case "groups": {
        return `${conf.platforms.admin.url}/index.html?#/${key}/${f.id}`;
      }
      default:
        return `${conf.platforms.admin.url}/index.html`;
    }
  };

export const getProfileLink = (
  key: io.http.ResourcesNames,
  f: { id: string },
): string => {
  switch (key) {
    case "stories":
      return `/stories/${f.id}/edit`;
    case "media":
    case "events/suggestions": {
      return `/profile/${key}/${f.id}?type=Update`;
    }
    default:
      return `/profile`;
  }
};

export const navigateTo = async <K extends io.http.ResourcesNames>(
  nav: NavigateFunction,
  resourceName: K,
  f: { path?: string; id: string },
): Promise<void> => {
  switch (resourceName) {
    case `stories`:
    case "events":
    case "actors":
    case "keywords":
    case "projects":
    case "groups": {
      await Promise.resolve(nav(`/${resourceName}/${f.id}`));
      break;
    }
    case "profile": {
      await Promise.resolve(nav(`/profile/${f.path}/${f.id}`));
      break;
    }
    default:
      await Promise.resolve(undefined);
  }
};

export const navigateToProfile = async (
  nav: NavigateFunction,
  resourceName: io.http.ResourcesNames,
  f: { id: string },
): Promise<void> => {
  switch (resourceName) {
    case "events/suggestions": {
      await Promise.resolve(nav(`/profile/${resourceName}/${f.id}`));
      break;
    }
    default:
      await Promise.resolve(undefined);
  }
};
