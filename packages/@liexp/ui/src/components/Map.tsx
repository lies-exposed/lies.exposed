import { type FeatureLike } from "ol/Feature.js";
import type Feature from "ol/Feature.js";
import OlMap from "ol/Map.js";
import * as OlControl from "ol/control.js";
import type Geometry from "ol/geom/Geometry.js";
import * as OlInteraction from "ol/interaction.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import OSM from "ol/source/OSM.js";
import VectorSource from "ol/source/Vector.js";
import { Circle, Fill, Stroke, Style } from "ol/style.js";
import * as React from "react";
import { geoJSONFormat } from "../utils/map.utils.js";
import "ol/ol.css";

export interface MapProps<G extends Geometry> {
  id: string;
  width: number;
  height: number;
  features: Array<Feature<G>>;
  center?: [number, number];
  zoom?: number;
  interactions?: any;
  controls?: any;
  onMapClick: (geoms: FeatureLike[]) => void;
}

const Map = <G extends Geometry>({
  id,
  width,
  height,
  features,
  center,
  zoom,
  interactions,
  controls,
  onMapClick,
}: MapProps<G>): JSX.Element => {
  const mapId = `map-${id}`;

  React.useEffect(() => {
    const featureSource = new VectorSource({
      format: geoJSONFormat,
      features,
    });

    const featuresLayer = new VectorLayer({
      source: featureSource,
      style: (feature) => {
        const props = feature.getProperties();
        if (props.type === "Uncategorized") {
          const fill = new Fill({
            color: `#33333380`,
          });
          const stroke = new Stroke({
            color: `#33000080`,
            width: 2,
          });
          return new Style({
            fill,
            stroke,
            image: new Circle({
              radius: 4,
              fill,
              stroke,
            }),
          });
        }

        const fill = new Fill({
          color: `#333333`,
        });

        const stroke = new Stroke({
          color: `#333333`,
          width: 2,
        });
        return new Style({
          fill,
          stroke,
          image: new Circle({
            radius: 4,
            fill,
            stroke,
          }),
        });
      },
    });

    const map = new OlMap({
      interactions: OlInteraction.defaults({
        doubleClickZoom: false,
        dragPan: false,
        mouseWheelZoom: false,
        pinchZoom: true,
        ...interactions,
      }),
      controls: OlControl.defaults(controls),
      target: mapId,
      layers: [
        new TileLayer({
          source: new OSM({}),
        }),
        featuresLayer,
      ],
    });

    if (center) {
      map.getView().setCenter(center);
    }

    if (zoom) {
      map.getView().setZoom(zoom);
    }

    // center map based on features source layer
    const size = map.getSize();
    const totalPadding = 20 * 2;

    if (size) {
      if (!featureSource.isEmpty()) {
        map.getView().fit(featureSource.getExtent(), {
          size: [size[0] - totalPadding, size[1] - totalPadding],
          maxZoom: 12,
        });
      } else {
        map.getView().setViewportSize(size);
      }
    }

    map.on("click", (evt) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      featuresLayer.getFeatures(evt.pixel).then((features) => {
        onMapClick(features);
      });
    });

    return () => {
      const mapDiv = document.querySelector(`#${mapId}`);
      if (mapDiv !== null) {
        mapDiv.innerHTML = "";
      }
    };
  }, [width, height, features]);

  return <div id={mapId} style={{ width, height }} />;
};

export default Map;
