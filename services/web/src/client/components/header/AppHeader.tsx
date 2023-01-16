import Header, { HeaderMenuItem } from "@liexp/ui/components/Header";
import { useNavigateTo } from "@liexp/ui/utils/history.utils";
import * as React from "react";
import { useHasAuth } from "../../utils/auth.utils";
import { useNavigateToResource } from "../../utils/location.utils";

const projectMenuItem: HeaderMenuItem = {
  view: "/project",
  label: "Project",
  subItems: [],
};

const dataMenuItem: HeaderMenuItem = {
  view: "index",
  label: "Data",
  subItems: [
    {
      view: "/events",
      label: "Events",
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
      view: "/profile/articles",
      label: "Articles",
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
      pathname={pathname}
      menu={[projectMenuItem, dataMenuItem, userMenuItem]}
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
