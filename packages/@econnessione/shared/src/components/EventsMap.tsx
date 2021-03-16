import { Area, Events } from "@io/http";
import { navigate } from "@reach/router";
import { geoJSONFormat } from "@utils/map.utils";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import Feature from "ol/Feature";
import * as React from "react";
import Map from "./Map";

interface EventsMapProps {
  events: Events.Event[];
  width: number;
  height: number;
  center?: [number, number];
  zoom?: number;
}

export const EventsMap: React.FC<EventsMapProps> = ({
  events,
  width,
  height,
  center = [9.18951, 45.46427],
  zoom = 12,
}) => {
  // const eventPoints: Topology<{
  //   points: GeometryCollection<Events.Uncategorized.Uncategorized>;
  // }> = {
  //   type: "Topology",
  //   arcs: [],
  //   objects: {
  //     points: {
  //       type: "GeometryCollection",
  //       geometries: events
  //         .filter(Events.Uncategorized.Uncategorized.is)
  //         .reduce((acc, e) => {
  //           if (e.location === undefined) {
  //             return acc;
  //           }
  //           return acc.concat([
  //             {
  //               ...e.location,
  //               properties: e,
  //             },
  //           ]);
  //         }, initialAcc),
  //     },
  //   },
  // };

  // const data = topojson.feature(eventPoints, eventPoints.objects.points);
  const data = pipe(
    events,
    A.filter(Events.Uncategorized.Uncategorized.is),
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
            }}
          >
            <Map
              id="events"
              width={width}
              height={height}
              features={features}
              center={center}
              zoom={zoom}
              onMapClick={async (features) => {
                if (features.length > 0) {
                  const area = features[0].getProperties() as Area.Area;
                  if (area) {
                    await navigate(`/events/${area.id}`);
                  }
                }
              }}
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
