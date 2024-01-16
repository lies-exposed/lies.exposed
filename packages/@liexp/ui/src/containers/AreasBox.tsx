import * as React from "react";
import { type GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer.js";
import { AreaList, type Area } from "../components/lists/AreaList.js";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider.js";

const AreasBox: React.FC<{
  params: GetListParams;
  style?: React.CSSProperties;
  onItemClick: (item: Area) => void;
}> = ({ params, onItemClick, style }) => {
  const Queries = useEndpointQueries();
  return (
    <QueriesRenderer
      queries={{ areas: Queries.Area.list.useQuery(params, undefined, false) }}
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
