import Header, { HeaderMenuItem } from "@liexp/ui/components/Header";
import * as React from "react";
import { useHasAuth } from "../../utils/auth.utils";
import { useNavigateTo } from "../../utils/history.utils";
import { useNavigateToResource } from "../../utils/location.utils";

const dataMenuItem = {
  view: "index",
  label: "Explore",
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
    {
      view: "/articles",
      label: "Stories",
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
  const navigateTo = useNavigateTo();
  const navigateToResource = useNavigateToResource();
  const hasAuth = useHasAuth();

  const userMenuItem = hasAuth ? profileMenuItem : loginMenuItem;
  return (
    <Header
      menu={[dataMenuItem, userMenuItem]}
      onTitleClick={() => {
        navigateToResource.index({});
      }}
      onMenuItemClick={(m) => {
        navigateTo.navigateTo(m.view);
      }}
    />
  );
};

export default AppHeader;
