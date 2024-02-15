import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { type NetworkType } from "@liexp/shared/lib/io/http/Network.js";
import { useRecordContext, useRefresh } from "ra-core";
import { Button, LoadingIndicator } from "ra-ui-materialui";
import * as React from "react";
import { EventsNetworkGraphBox } from "../../../../containers/graphs/EventsNetworkGraphBox.js";
import { useDataProvider } from "../../../../hooks/useDataProvider.js";
import { Grid } from "../../../mui/index.js";

export const EventsNetworkGraphFormTab: React.FC<{
  type: NetworkType;
}> = ({ type }) => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const apiProvider = useDataProvider();
  if (!record?.id) {
    return <LoadingIndicator />;
  }

  const handleRegenerateFlow = (): void => {
    void apiProvider
      .put(`networks/${type}/${id}`, { regenerate: true })
      .then(() => {
        refresh();
      });
  };

  const id: any = record.id;
  const query = getRelationIds(record as any);

  return (
    <div style={{ height: 800, width: "100%" }}>
      <Grid container style={{ height: "100%", width: "100%" }}>
        <Grid item md={10} style={{ maxHeight: "100%" }}>
          <EventsNetworkGraphBox
            type={type}
            query={{
              ...query,
              ids: [id],
            }}
            relations={["actors", "groups", "keywords"]}
            onEventClick={() => {}}
          />
        </Grid>
        <Grid item md={2}>
          <Button
            variant="contained"
            label="Regenerate"
            onClick={handleRegenerateFlow}
          />
        </Grid>
      </Grid>
    </div>
  );
};
