import { MainContent } from "@econnessione/shared/components/MainContent";
import SEO from "@econnessione/shared/components/SEO";
import { RouteComponentProps } from "@reach/router";
import React from "react";

const NotFoundPage: React.FC<RouteComponentProps> = () => (
  <MainContent>
    <SEO title="404: Not found" />
    <h1>NOT FOUND</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </MainContent>
);

export default NotFoundPage;
