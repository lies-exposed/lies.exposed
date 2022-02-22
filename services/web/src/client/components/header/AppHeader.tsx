import Header, { HeaderMenuItem } from "@econnessione/ui/components/Header";
import { useNavigateTo } from 'client/utils/history.utils';
import * as React from "react";
import { useNavigateToResource } from "../../utils/location.utils";

const dataMenuItem = {
  view: "index",
  label: "Dashboards",
  subItems: [
    {
      view: "events",
      label: "Events",
    },
    {
      view: "vaccines-dashboard",
      label: "Covid19 Vaccines",
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

export const mainMenu: HeaderMenuItem[] =
  process.env.NODE_ENV === "development"
    ? [
        // projectMenuItem,
        // {
        //   view: "blog",
        //   label: "Blog",
        //   subItems: [],
        // },
        // dataMenuItem,
      ]
    : [dataMenuItem];

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
