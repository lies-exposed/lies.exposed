import { defaultGetLinksQueryParams } from '@liexp/ui/lib/state/queries/link.queries';
import { LinksPageTemplate } from "@liexp/ui/lib/templates/links/LinksPageTemplate";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const LinksPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();

  return (
    <LinksPageTemplate
      params={defaultGetLinksQueryParams}
      onItemClick={(a) => {
        navigateTo.links({ id: a.id });
      }}
    />
  );
};

export default LinksPage;
