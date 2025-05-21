import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type EndpointQueryType } from "@ts-endpoint/core";
import * as React from "react";
import QueriesRenderer from "../components/QueriesRenderer.js";
import { AreaList, type Area } from "../components/lists/AreaList.js";

const AreasBox: React.FC<{
  params: Partial<EndpointQueryType<typeof Endpoints.Area.List>>;
  style?: React.CSSProperties;
  onItemClick: (item: Area) => void;
}> = ({ params, onItemClick, style }) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        areas: Q.Area.list.useQuery(undefined, params, false),
      })}
      render={({ areas: { data: areas } }) => {
        return (
          <AreaList
            style={style}
            areas={areas.map((a) => ({ ...a, selected: true }))}
            onAreaClick={onItemClick}
          />
        );
      }}
    />
  );
};

export default AreasBox;
