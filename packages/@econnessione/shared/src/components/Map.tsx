import { geoJSONFormat } from "@utils/map.utils";
import Feature from "ol/Feature";
import OlMap from "ol/Map";
import * as OlControl from "ol/control";
import Geometry from "ol/geom/Geometry";
import * as OlInteraction from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { Circle, Fill, Stroke, Style } from "ol/style";
import * as React from "react";

interface MapProps {
  id: string;
  width: number;
  height: number;
  features: Feature[];
  center?: [number, number];
  zoom?: number;
  interactions?: OlInteraction.DefaultsOptions;
  controls?: OlControl.DefaultsOptions;
  onMapClick: (geoms: Array<Feature<Geometry>>) => void;
}

const Map: React.FC<MapProps> = ({
  id,
  width,
  height,
  features,
  center,
  zoom,
  interactions,
  controls,
  onMapClick,
}) => {
  const mapId = `map-${id}`;

  React.useEffect(() => {
    const featureSource = new VectorSource({
      format: geoJSONFormat,
      features,
    });

    const featuresLayer = new VectorLayer({
      source: featureSource,
      style: (feature) => {
        const fill = new Fill({
          color: `#33333380`,
        });
        const stroke = new Stroke({
          color: `#FF000080`,
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

    // center map based on features source layer
    const size = map.getSize();
    const totalPadding = 20 * 2;

    if (size) {
      map.getView().fit(featureSource.getExtent(), {
        size: [size[0] - totalPadding, size[1] - totalPadding],
        maxZoom: 12,
      });
    }

    if (center) {
      map.getView().setCenter(center);
    }
    if (zoom) {
      map.getView().setZoom(zoom);
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
  });

  return <div id={mapId} style={{ width, height }} />;
};

export default Map;
