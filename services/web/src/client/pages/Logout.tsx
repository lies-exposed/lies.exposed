import { FullSizeLoader } from "@liexp/ui/lib/components/Common/FullSizeLoader.js";
import { useAuthProvider } from "@liexp/ui/lib/components/admin/react-admin.js";
import { Container } from "@liexp/ui/lib/components/mui/index.js";
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
