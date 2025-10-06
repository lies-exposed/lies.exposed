import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Nation } from "@liexp/shared/lib/io/http/Nation.js";
import { type EndpointQueryType } from "@ts-endpoint/core";
import * as React from "react";
import { FlagIcon } from "../components/Common/Icons/FlagIcon.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import { Stack } from "../components/mui/index.js";

const NationalitiesBox: React.FC<{
  params: Partial<EndpointQueryType<typeof Endpoints.Nation.List>>;
  style?: React.CSSProperties;
  onItemClick: (item: Nation) => void;
}> = ({ params, onItemClick: _onItemClick, style }) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        nations: Q.Nation.list.useQuery(undefined, params, false),
      })}
      render={({ nations: { data: nations } }) => {
        return (
          <Stack direction="row" spacing={1} style={style}>
            {nations.map((a) => (
              <FlagIcon key={a.id} isoCode={a.isoCode} />
            ))}
          </Stack>
        );
      }}
    />
  );
};

export default NationalitiesBox;
