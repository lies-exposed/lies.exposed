import { authProvider } from "@liexp/ui/client/api";
import { FullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import { Container } from "@mui/system";
import { RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const LogoutPage: React.FC<RouteComponentProps> = () => {
  const navTo = useNavigateToResource();

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
