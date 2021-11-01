import { Events } from "@econnessione/shared/io/http";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import Feature from "ol/Feature";
import * as React from "react";
import { Queries } from "../providers/DataProvider";
import { geoJSONFormat } from "../utils/map.utils";
import { ErrorBox } from "./Common/ErrorBox";
import { LazyFullSizeLoader } from "./Common/FullSizeLoader";
import Map from "./Map";

interface EventsMapProps {
  filter: any;
  center?: [number, number];
  zoom?: number;
  onMapClick: (features: any[]) => void;
}

export const EventsMap: React.FC<EventsMapProps> = ({
  center,
  zoom,
  filter: { startDate, endDate, title, ...filters },
  onMapClick,
}) => {
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
      render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ events, deaths }) => {
        const data = pipe(
          events.data,
          A.filter(Events.Uncategorized.Uncategorized.is),
          A.filterMap((e) =>
            e.location ? O.some({ ...e, geometry: e.location }) : O.none
          )
        );

        const deathsData = pipe(
          deaths.data,
          A.filterMap((e) =>
            e.location ? O.some({ ...e, geometry: e.location }) : O.none
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
          <>
            <ParentSize style={{ height: 600 }}>
              {({ width, height }) => {
                return (
                  <div
                    style={{
                      marginLeft: "auto",
                      marginRight: "auto",
                      marginTop: 20,
                      marginBottom: 20,
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
          </>
        );
      })}
    />
  );
};
