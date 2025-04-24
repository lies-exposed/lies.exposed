import { toGetNetworkQuery } from "@liexp/shared/lib/helpers/event/event.js";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import {
  type GetNetworkQuerySerialized,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import { type Actor, type Group } from "@liexp/shared/lib/io/http/index.js";
import { subYears } from "date-fns";
import * as React from "react";
import { EventsNetworkGraphBox } from "../../../../containers/graphs/EventsNetworkGraphBox/EventsNetworkGraphBox.js";
import { useDataProvider } from "../../../../hooks/useDataProvider.js";
import { Grid } from "../../../mui/index.js";
import {
  Button,
  LoadingIndicator,
  useRecordContext,
  useRefresh,
} from "../../react-admin.js";

export const EventsNetworkGraphFormTab: React.FC<{
  type: NetworkType;
}> = ({ type }) => {
  const record = useRecordContext<Event | Actor.Actor | Group.Group>();
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

  const id = record.id;
  const query: GetNetworkQuerySerialized =
    type === "events"
      ? toGetNetworkQuery(getRelationIds(record as Event))
      : {
          ids: [id],
          relations: ["actors", "groups", "keywords"],
          keywords: null,
          actors: null,
          groups: null,
          startDate: null,
          endDate: null,
          emptyRelations: null,
        };

  return (
    <div style={{ height: 800, width: "100%" }}>
      <Grid container style={{ height: "100%", width: "100%" }}>
        <Grid size={{ md: 10 }} style={{ maxHeight: "100%" }}>
          <EventsNetworkGraphBox
            type={type}
            query={{
              ...query,
              startDate: subYears(new Date(), 300).toISOString(),
              endDate: new Date().toISOString(),
              ids: [id],
            }}
            relations={["actors", "groups", "keywords"]}
            onEventClick={() => {}}
          />
        </Grid>
        <Grid size={{ md: 2 }}>
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
