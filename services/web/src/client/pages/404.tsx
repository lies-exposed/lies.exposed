import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useLocation } from "react-router-dom";

const NotFoundPage: React.FC<RouteComponentProps> = () => {
  const location = useLocation();
  return (
    <MainContent>
      <SEO title="404: Not found" image="" urlPath={location.pathname} />
      <h1>NOT FOUND</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </MainContent>
  );
};
export default NotFoundPage;
