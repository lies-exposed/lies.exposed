import Header, { HeaderMenuItem } from "@liexp/ui/components/Header";
import * as React from "react";
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
  ],
};
const profileMenuItem: HeaderMenuItem = {
  view: "/profile",
  label: "Profile",
  subItems: []
};

export const mainMenu: HeaderMenuItem[] = [dataMenuItem, profileMenuItem];

const AppHeader: React.FC = () => {
  const navigateTo = useNavigateTo();
  const navigateToResource = useNavigateToResource();

  return (
    <Header
      menu={mainMenu}
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
