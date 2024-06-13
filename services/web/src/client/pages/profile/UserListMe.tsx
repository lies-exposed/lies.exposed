import { useRedirect } from "ra-core";
import * as React from "react";

export const UserListMe: React.FC = () => {
  const redirect = useRedirect();
  React.useEffect(() => {
    if (!window.location.href.includes("/profile/users/me")) {
      redirect("/profile/users/me");
    }
  }, []);

  return null;
};
