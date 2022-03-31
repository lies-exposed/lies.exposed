import { MainContent } from "@liexp/ui/components/MainContent";
import SEO from "@liexp/ui/components/SEO";
import { RouteComponentProps } from "@reach/router";
import * as React from "react";

const NotFoundPage: React.FC<RouteComponentProps> = () => (
  <MainContent>
    <SEO title="404: Not found" image="" urlPath={"/404"} />
    <h1>NOT FOUND</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </MainContent>
);

export default NotFoundPage;
