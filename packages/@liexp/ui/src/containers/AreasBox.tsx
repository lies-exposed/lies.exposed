import * as React from "react";
import { type GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer";
import { type Area, AreaList } from "../components/lists/AreaList";
import { useAreasQuery } from "../state/queries/area.queries";

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
