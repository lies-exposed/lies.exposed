import { Loader } from "@liexp/ui/components/Common/Loader";
import Header, { HeaderMenuItem } from "@liexp/ui/components/Header";
import * as React from "react";
import { useGetIdentity } from "react-admin";
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

const loginMenuItem: HeaderMenuItem = {
  view: "/profile/login",
  label: "Login",
  subItems: [],
};
const profileMenuItem: HeaderMenuItem = {
  view: "/profile",
  label: "Profile",
  subItems: [
    {
      view: "/logout",
      label: "Logout",
    },
  ],
};

const AppHeader: React.FC = () => {
  const navigateTo = useNavigateTo();
  const navigateToResource = useNavigateToResource();
  const identity = useGetIdentity();

  const userMenuItem = identity.isLoading
    ? { view: "/", label: <Loader />, subItems: [] }
    : identity.data?.id === ""
    ? loginMenuItem
    : profileMenuItem;
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
