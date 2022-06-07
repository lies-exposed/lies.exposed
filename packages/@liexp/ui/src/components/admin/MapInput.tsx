import { uuid } from "@liexp/shared/utils/uuid";
import get from "lodash/get";
import Map from "ol/Map.js";
import View from "ol/View.js";
import GeoJSON from "ol/format/GeoJSON";
import GeometryType from "ol/geom/GeometryType";
import Draw from "ol/interaction/Draw.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM as OSMSource, Vector as VectorSource } from "ol/source";
import * as React from "react";
import {
  Button,
  FormDataConsumer,
  InputProps,
  SelectInput,
  useInput,
} from "react-admin";

const formatOptions = {
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
};
const getDefaultFormat = (): GeoJSON => new GeoJSON(formatOptions);

const getDefaultMap = (
  target: HTMLDivElement,
  featuresLayer: VectorLayer<VectorSource<any>>
): Map => {
  return new Map({
    target,
    layers: [new TileLayer({ source: new OSMSource() }), featuresLayer],
    view: new View({ center: [0, 0], zoom: 2 }),
  });
};

type MapInputProps = InputProps & {
  type: string;
};

export const MapInputType = GeometryType;

const MapInput: React.FC<MapInputProps> = (props) => {
  const inputProps = useInput(props);

  const {
    field: { value, onChange },
  } = inputProps;

  const [id] = React.useState(uuid());
  const mapContainer = React.createRef<HTMLDivElement>();
  const mapClassName = `map-input-${id}`;

  React.useEffect(() => {
    if (document.querySelector(`.${mapClassName}`)?.innerHTML === "") {
      const format = getDefaultFormat();
      const features = value ? [format.readFeature(value)] : [];
      const featuresSource = new VectorSource({ features, wrapX: false });
      const featuresLayer = new VectorLayer({ source: featuresSource });

      const target = mapContainer.current;
      if (target) {
        const map = getDefaultMap(target, featuresLayer);
        if (features.length > 0) {
          map.getView().fit(featuresSource.getExtent(), {
            maxZoom: 16,
            padding: [80, 80, 80, 80],
          });
        }

        const draw = new Draw({
          source: featuresSource,
          type: props.type,
        });
        map.addInteraction(draw);

        const writeOptions = { decimals: 7 };
        draw.on("drawend", (opts) => {
          featuresSource.clear();
          const geometry = opts.feature.getGeometry();
          if (geometry) {
            onChange(format.writeGeometry(geometry, writeOptions));
          }
        });
      }
    }

    return () => {
      const mapDiv = document.querySelector(`.${mapClassName}`);
      if (mapDiv !== null) {
        mapDiv.innerHTML = "";
      }
    };
  });

  // eslint-disable-next-line
  // console.log({ mapContainer, mapClassName });

  return (
    <>
      <div
        className={mapClassName}
        ref={mapContainer}
        style={{ height: 300, width: 600 }}
      />
      <div style={{ marginTop: 20 }}>
        <Button
          label="reset"
          variant="outlined"
          onClick={() => onChange({ type: props.type, coordinates: [] })}
        />
      </div>
    </>
  );
};

const MapInputWrapper: React.FC<MapInputProps> = (props) => {
  return (
    <>
      <SelectInput
        source={`${props.source}.type`}
        choices={[GeometryType.POINT, GeometryType.POLYGON].map((t) => ({
          id: t,
          name: t,
        }))}
        defaultValue={GeometryType.POINT}
      />
      <FormDataConsumer>
        {({ formData, ...rest }) => {
          const type = get(formData, `${props.source}.type`);
          return <MapInput {...props} type={type} {...rest} />;
        }}
      </FormDataConsumer>
    </>
  );
};

export { MapInputWrapper as MapInput };
