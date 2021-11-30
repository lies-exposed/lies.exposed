import { EventsMap } from "@components/EventsMap";
import {
  a11yProps,
  TabPanel,
} from "@econnessione/ui/components/Common/TabPanel";
import { Box, Tab, Tabs } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { InfiniteEventListParams } from "../state/queries";
import { CurrentView, doUpdateCurrentView } from "../utils/location.utils";
import { EventsNetwork } from "./EventsNetwork";
import InfiniteEventList from "./InfiniteEventList";

interface EventsPanelProps {
  view: CurrentView;
  tab?: number;
  hash?: string;
  filters: InfiniteEventListParams;
}
export const EventsPanel: React.FC<EventsPanelProps> = ({
  view,
  tab = 0,
  filters,
  hash,
}) => {
  const handleUpdateCurrentView = React.useCallback(
    (update: Partial<Omit<CurrentView, "view">>): void => {
      void doUpdateCurrentView({
        ...view,
        ...filters,
        ...update,
      })();
    },
    [hash, tab, filters]
  );

  return (
    <Box style={{ width: "100%" }}>
      <Tabs
        style={{ width: "100%", marginBottom: 30 }}
        value={tab}
        onChange={(e, tab) => handleUpdateCurrentView({ tab })}
      >
        <Tab label="list" {...a11yProps(0)} />
        <Tab label="map" {...a11yProps(1)} />
        <Tab label="network" {...a11yProps(2)} />
      </Tabs>

      <TabPanel value={tab} index={0}>
        {tab === 0 ? (
          <InfiniteEventList hash={hash ?? "default"} filters={filters} />
        ) : null}
      </TabPanel>
      <TabPanel value={tab} index={1}>
        {tab === 1 ? (
          <EventsMap
            filter={{
              actors: [],
              groups: [],
            }}
            onMapClick={() => {}}
          />
        ) : null}
      </TabPanel>
      <TabPanel value={tab} index={2}>
        {tab === 2 ? (
          <EventsNetwork
            filter={filters}
            groupBy={"actor"}
            scale={"all"}
            scalePoint={O.none}
            onEventClick={(e) => {
              void doUpdateCurrentView({
                view: "event",
                eventId: e.id,
              })();
            }}
          />
        ) : null}
        <div />
      </TabPanel>
    </Box>
  );
};
