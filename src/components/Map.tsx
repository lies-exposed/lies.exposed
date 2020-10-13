import { AreaFrontmatter } from "@models/area"
import Feature from 'ol/Feature';
import OlMap from "ol/Map"
import View from "ol/View"
import GEOJSON from "ol/format/GeoJSON"
import Geometry from 'ol/geom/Geometry'
import TileLayer from "ol/layer/Tile"
import VectorLayer from "ol/layer/Vector"
import * as OlProj from "ol/proj"
import OSM from "ol/source/OSM"
import VectorSource from "ol/source/Vector"
import { Fill, Stroke, Style } from "ol/style"
import * as React from "react"
import "ol/ol.css"

const formatOptions = {
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
}

const geoJSONFormat = new GEOJSON(formatOptions)

interface MapProps {
  width: number
  height: number
  featureCollection: any
  center: [number, number]
  zoom: number
  onMapClick: (geoms: Array<Feature<Geometry>>) => void
}

const Map: React.FC<MapProps> = ({
  width,
  height,
  featureCollection,
  center,
  zoom,
  onMapClick
}) => {
  React.useEffect(() => {
    const features = geoJSONFormat.readFeatures(featureCollection)

    const source = new VectorSource({
      format: geoJSONFormat,
      features,
    })


    const layer = new VectorLayer({
      source,
      style: (feature) => {
        const area = feature.getProperties() as AreaFrontmatter
        return new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.6)",
          }),
          stroke: new Stroke({
            color: `#${area.color}`,
            width: 2,
          }),
        })
      },
    })

    const map = new OlMap({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        layer,
      ],
    })

    map.setView(
      new View({
        center: OlProj.fromLonLat(center),
        zoom,
      })
    )

    map.on("click", (evt) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      layer.getFeatures(evt.pixel).then((features) => {
        onMapClick(features)
      })
    })

    return () => {
      const mapDiv = document.querySelector('#map')
      if (mapDiv !== null) {
        mapDiv.innerHTML = ""
      }
    }
  })

  return <div id="map" style={{ width, height }} />
}

export default Map
