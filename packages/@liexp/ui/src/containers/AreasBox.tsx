import * as React from "react";
import { GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer";
import { Area, AreaList } from "../components/lists/AreaList";
import { useAreasQuery } from "../state/queries/DiscreteQueries";

const AreasBox: React.FC<{
  params: GetListParams;
  style?: React.CSSProperties;
  onItemClick: (item: Area) => void;
}> = ({ params, onItemClick, style }) => {
  return (
    <QueriesRenderer
      queries={{ areas: useAreasQuery(params, false) }}
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
