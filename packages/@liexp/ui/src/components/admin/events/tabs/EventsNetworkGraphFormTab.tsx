import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds";
import { type NetworkType } from "@liexp/shared/lib/io/http/Network";
import { useRecordContext, useRefresh } from "ra-core";
import { Button, LoadingIndicator } from "ra-ui-materialui";
import * as React from "react";
import { apiProvider } from "../../../../client/api";
import { EventsNetworkGraphBox } from "../../../../containers/graphs/EventsNetworkGraphBox";
import { Grid } from "../../../mui";

export const EventsNetworkGraphFormTab: React.FC<{
  type: NetworkType;
}> = ({ type }) => {
  const record = useRecordContext();
  const refresh = useRefresh();

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
