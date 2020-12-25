import { Area, Common } from "@econnessione/io"
import * as React from "react"
import Map from "./Map"

interface AreasMapProps<F extends Common.BaseFrontmatter> {
  areas: F[]
  width: number
  height: number
}

const AreasMap = ({
  areas,
  width,
  height,
}: AreasMapProps<Area.AreaFrontmatter>): JSX.Element => {
  const data = {
    type: `FeatureCollection` as "FeatureCollection",
    features: areas
      .map((a) => ({
        type: `Feature` as "Feature",
        geometry: a.polygon,
        properties: a,
      })),
  }

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
        width={width}
        height={height}
        featureCollection={data}
        center={data.features[0].geometry.coordinates[0][0]}
        zoom={2}
        onMapClick={async (features) => {
          // const area = features[0].getProperties() as Area.AreaFrontmatter
          // await navigate(`/areas/${area.id}`)
        }}
      />
    </div>
  )
}

export default AreasMap
