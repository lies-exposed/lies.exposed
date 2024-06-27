import { FullSizeLoader } from "@liexp/ui/lib/components/Common/FullSizeLoader.js";
import { Container } from "@mui/system";
import { useAuthProvider } from "ra-core";
import * as React from "react";
import { type RouteProps as RouteComponentProps } from "react-router";
import { useNavigateToResource } from "../utils/location.utils";

const LogoutPage: React.FC<RouteComponentProps> = () => {
  const navTo = useNavigateToResource();
  const authProvider = useAuthProvider();
  React.useEffect(() => {
    if (authProvider) {
      void authProvider.checkAuth({}).then(() => {
        void authProvider.logout({}).then(() => {
          navTo.index({});
        });
      });
    }
  }, []);

  return (
    <Container>
      <FullSizeLoader />
    </Container>
  );
};

export default LogoutPage;
