import Header, { HeaderMenuItem } from "@liexp/ui/components/Header";
import * as React from "react";
import { useNavigateTo } from "../../utils/history.utils";
import { useNavigateToResource } from "../../utils/location.utils";

const dataMenuItem = {
  view: "index",
  label: "Events",
  subItems: [
    {
      view: "/events",
      label: "Search",
    },
  ],

};

const projectMenuItem = {
  view: "project",
  label: "Project",
  subItems: [
    {
      view: "docs",
      label: "Docs",
    },
  ],
};

export const mainMenu: HeaderMenuItem[] = [dataMenuItem];

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
