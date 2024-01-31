import Header from "@liexp/ui/lib/components/Header/Header.js";
import { type HeaderMenuItem } from "@liexp/ui/lib/components/Header/HeaderMenu/types.js";
import { useNavigateTo } from "@liexp/ui/lib/utils/history.utils.js";
import * as React from "react";
import { useHasAuth } from "../../utils/auth.utils";
import { useNavigateToResource } from "../../utils/location.utils";

export const logo192 = "/logo192.png";

const projectMenuItem: HeaderMenuItem = {
  view: "/project",
  label: "Project",
  subItems: [],
};

const storiesMenuItem: HeaderMenuItem = {
  view: "/stories",
  label: "Stories",
  subItems: [],
};

const dataMenuItem: HeaderMenuItem = {
  view: "index",
  label: "Data",
  subItems: [
    {
      view: "/events",
      label: "Explore",
    },
    {
      view: "/keywords",
      label: "Keywords",
    },
    {
      view: "/actors",
      label: "Actors",
    },
    {
      view: "/groups",
      label: "Groups",
    },
    {
      view: "/areas",
      label: "Locations",
    },
    {
      view: "/media",
      label: "Media",
    },
    {
      view: "/links",
      label: "Links",
    },
  ],
};

const loginMenuItem: HeaderMenuItem = {
  view: "/profile/login",
  label: "Login",
  subItems: [],
};
const profileMenuItem: HeaderMenuItem = {
  label: "Profile",
  view: "/profile",
  subItems: [
    {
      view: "/profile/links",
      label: "Links",
    },
    {
      view: "/profile/media",
      label: "Media",
    },
    {
      view: "/profile/events/suggestions",
      label: "Event Suggestions",
    },
    {
      view: "/profile/stories",
      label: "Stories",
    },
    {
      view: "/logout",
      label: "Logout",
    },
  ],
};

const AppHeader: React.FC = () => {
  const { navigateTo, pathname } = useNavigateTo();
  const navigateToResource = useNavigateToResource();
  const hasAuth = useHasAuth();

  const userMenuItem = hasAuth ? profileMenuItem : loginMenuItem;

  return (
    <Header
      logoSrc={logo192}
      pathname={pathname}
      menu={[projectMenuItem, storiesMenuItem, dataMenuItem, userMenuItem]}
      onTitleClick={() => {
        navigateToResource.index({});
      }}
      onMenuItemClick={(m) => {
        navigateTo(m.view);
      }}
    />
  );
};

export default AppHeader;
