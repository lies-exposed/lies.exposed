import { Events } from "@econnessione/shared/io/http";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import Feature from "ol/Feature";
import * as React from "react";
import { Queries } from "../providers/DataProvider";
import { geoJSONFormat } from "../utils/map.utils";
import { ErrorBox } from "./Common/ErrorBox";
import { LazyFullSizeLoader } from "./Common/FullSizeLoader";
import Map from "./Map";

interface EventsMapComponentProps {
  events: Events.Event[];
  center?: [number, number];
  zoom?: number;
  onMapClick: (features: any[]) => void;
}

const EventsMapComponent: React.FC<EventsMapComponentProps> = ({
  center,
  zoom,
  onMapClick,
  events,
}) => {
  const data = pipe(
    events,
    A.filter(Events.Uncategorized.Uncategorized.is),
    A.filterMap((e) =>
      e.payload.location
        ? O.some({ ...e, geometry: e.payload.location })
        : O.none
    )
  );

  const deathsData = pipe(
    events,
    A.filter(Events.Death.Death.is),
    A.filterMap((e) =>
      e.payload.location
        ? O.some({ ...e, geometry: e.payload.location })
        : O.none
    )
  );

  const features = data.map(({ geometry, ...datum }) => {
    const geom = geoJSONFormat.readGeometry(geometry);
    const feature = new Feature(geom);
    feature.setProperties(datum);
    return feature;
  });

  const deathFeatures = deathsData.map(({ geometry, ...datum }) => {
    const geom = geoJSONFormat.readGeometry(geometry);
    const feature = new Feature(geom);
    feature.setProperties(datum);
    return feature;
  });

  return (
    <ParentSize style={{ height: 600 }}>
      {({ width, height }) => {
        return (
          <div
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: 20,
              marginBottom: 20,
              width,
              height,
            }}
          >
            <Map
              id="events"
              width={width}
              height={height}
              features={[...features, ...deathFeatures]}
              center={center}
              zoom={zoom}
              onMapClick={onMapClick}
              interactions={{
                doubleClickZoom: true,
                dragPan: true,
              }}
            />
          </div>
        );
      }}
    </ParentSize>
  );
};

interface EventsMapProps extends Omit<EventsMapComponentProps, 'events'> {
  filter: any;
}

const EventsMap: React.FC<EventsMapProps> = (props) => {
  const {
    filter: { title, startDate, endDate, ...filters },
    ...rest
  } = props;
  return (
    <WithQueries
      queries={{
        events: Queries.Event.getList,
        deaths: Queries.DeathEvent.getList,
      }}
      params={{
        events: {
          pagination: { page: 1, perPage: 100 },
          sort: { field: "startDate", order: "DESC" },
          filter: {
            title: pipe(title ?? O.none, O.toUndefined),
            startDate:
              startDate?._tag === "Some"
                ? startDate.value.toISOString()
                : undefined,
            endDate:
              endDate?._tag === "Some"
                ? endDate.value.toISOString()
                : undefined,
            ...filters,
          },
        },
        deaths: {
          pagination: { page: 1, perPage: 20 },
          sort: { field: "date", order: "DESC" },
          filter: {
            groups: filters.groups ? O.toUndefined(filters.groups) : undefined,
          },
        },
      }}
      render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ events }) => {
        return <EventsMapComponent {...rest} events={events.data} />;
      })}
    />
  );
};

export default EventsMap;
