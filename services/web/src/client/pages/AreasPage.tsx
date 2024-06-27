import SearchAreaTemplate from "@liexp/ui/lib/templates/SearchAreaTemplate";
import * as React from "react";
import { type RouteProps as RouteComponentProps } from "react-router";
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
