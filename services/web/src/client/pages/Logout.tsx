import { FullSizeLoader } from "@liexp/ui/lib/components/Common/FullSizeLoader.js";
import { Container } from "@mui/system";
import { type RouteComponentProps } from "@reach/router";
import { useAuthProvider } from "ra-core";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const LogoutPage: React.FC<RouteComponentProps> = () => {
  const navTo = useNavigateToResource();
  const authProvider = useAuthProvider();
  React.useEffect(() => {
    void authProvider.checkAuth({}).then(() => {
      void authProvider.logout({}).then(() => {
        navTo.index({});
      });
    });
  }, []);

  return (
    <Container>
      <FullSizeLoader />
    </Container>
  );
};

export default LogoutPage;
