import { Common, Events } from "@econnessione/io"
import * as O from "fp-ts/lib/Option"
import * as React from "react"
import * as topojson from "topojson-client"
import { GeometryCollection, Topology } from "topojson-specification"
import GeoCustom from "./GeoCustom/GeoCustom"

interface EventsMapProps {
  events: Events.EventMD[]
  width: number
  height: number
}

interface GEOJSONEventPoint extends Common.Point {
  properties: Events.Uncategorized.Uncategorized
}

const EventsMap: React.FC<EventsMapProps> = ({ events, width, height }) => {
  const initialAcc: GEOJSONEventPoint[] = []

  const eventPoints: Topology<{
    points: GeometryCollection<Events.Uncategorized.Uncategorized>
  }> = {
    type: "Topology",
    arcs: [],
    objects: {
      points: {
        type: "GeometryCollection",
        geometries: events.filter(Events.Uncategorized.UncategorizedMD.is).reduce((acc, e) => {
          if (O.isNone(e.frontmatter.location)) {
            return acc
          }
          return acc.concat([
            {
              ...e.frontmatter.location.value,
              properties: e.frontmatter,
            },
          ])
        }, initialAcc),
      },
    },
  }

  const data = topojson.feature(eventPoints, eventPoints.objects.points)

  return (
    <div
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: 20,
        marginBottom: 20,
      }}
    >
      <GeoCustom<GEOJSONEventPoint>
        projection="equalEarth"
        width={width}
        height={height}
        data={data as any}
        featureRenderer={(f, i) => {
          const color = "white"
          return (
            <path
              key={`map-feature-${i}`}
              d={f.path ?? ""}
              stroke={color}
              strokeWidth={0.5}
              fill={color}
              onClick={async () => {
                // await navigate(`/events#${f.feature.properties.id}`)
              }}
            />
          )
        }}
      />
    </div>
  )
}

export default EventsMap
