import SearchAreaTemplate from "@liexp/ui/lib/templates/SearchAreaTemplate";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const AreasPage: React.FC<RouteComponentProps> = () => {
  const navigateTo = useNavigateToResource();

  return (
    <SearchAreaTemplate
      onAreaClick={(a) => {
        navigateTo.areas({ id: a.id });
      }}
    />
  );
};
export default AreasPage;
