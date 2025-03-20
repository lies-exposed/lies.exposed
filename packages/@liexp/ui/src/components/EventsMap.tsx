import { pipe, fp } from "@liexp/core/lib/fp/index.js";
import { Events } from "@liexp/shared/lib/io/http/index.js";
import { ParentSize } from "@visx/responsive";
import { Schema } from "effect";
import Feature from "ol/Feature.js";
import * as React from "react";
import { geoJSONFormat } from "../utils/map.utils.js";
import Map from "./Map.js";
import QueriesRenderer from "./QueriesRenderer.js";

interface EventsMapComponentProps {
  events: readonly Events.Event[];
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
    fp.A.filter(Schema.is(Events.Uncategorized.Uncategorized)),
    fp.A.filterMap((e) =>
      e.payload.location
        ? fp.O.some({ ...e, geometry: e.payload.location })
        : fp.O.none,
    ),
  );

  const deathsData = pipe(
    events,
    fp.A.filter(Schema.is(Events.Death.Death)),
    fp.A.filterMap((e) =>
      e.payload.location
        ? fp.O.some({ ...e, geometry: e.payload.location })
        : fp.O.none,
    ),
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

interface EventsMapProps extends Omit<EventsMapComponentProps, "events"> {
  filter: any;
}

const EventsMap: React.FC<EventsMapProps> = (props) => {
  const {
    filter: { title, startDate, endDate, ...filters },
    ...rest
  } = props;
  return (
    <QueriesRenderer
      queries={(Q) => ({
        events: Q.Event.list.useQuery(
          {
            pagination: { page: 1, perPage: 100 },
            sort: { field: "startDate", order: "DESC" },
            filter: {
              title: pipe(title ?? fp.O.none, fp.O.toUndefined),
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
          undefined,
          false,
        ),
      })}
      render={({ events }) => {
        return <EventsMapComponent {...rest} events={events.data} />;
      }}
    />
  );
};

export default EventsMap;
