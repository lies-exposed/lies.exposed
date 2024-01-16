import { defaultUseQueryListParams } from "@liexp/shared/lib/providers/EndpointQueriesProvider/params.js";
import { LinksPageTemplate } from "@liexp/ui/lib/templates/links/LinksPageTemplate";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const LinksPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();

  return (
    <LinksPageTemplate
      params={defaultUseQueryListParams}
      onItemClick={(a) => {
        navigateTo.links({ id: a.id });
      }}
    />
  );
};

export default LinksPage;
