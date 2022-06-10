import { http } from "@liexp/shared/io";
import { Polygon } from "@liexp/shared/io/http/Common/Geometry";
import { uuid } from "@liexp/shared/utils/uuid";
import _ from "lodash";
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
  type: http.Common.Geometry.Geometry['type'];
  value: http.Common.Geometry.Geometry;
  onReset: () => void;
};

export const MapInputType = GeometryType;

const MapInput: React.FC<MapInputProps> = ({
  value,
  onChange,
  onReset,
  ...props
}) => {
  const [id] = React.useState(uuid());
  const mapContainer = React.createRef<HTMLDivElement>();
  const mapClassName = `map-input-${id}`;

  React.useEffect(() => {
    if (document.querySelector(`.${mapClassName}`)?.innerHTML === "") {
      const format = getDefaultFormat();

      const features = value.coordinates ? [format.readFeature(value)] : [];

      const target = mapContainer.current;
      if (target) {
        const featuresSource = new VectorSource(
          features ? { features, wrapX: false } : { wrapX: true }
        );
        const featuresLayer = new VectorLayer(
          features ? { source: featuresSource } : {}
        );

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
            const geom = JSON.parse(
              format.writeGeometry(geometry, writeOptions)
            );
            onChange?.(geom);
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
  }, [props.type]);

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
        <Button label="reset" variant="outlined" onClick={() => onReset()} />
      </div>
    </>
  );
};

const MapInputWrapper: React.FC<MapInputProps> = (props) => {
  const typeSource = `${props.source}.type`;
  const typeField = useInput({
    ...props,
    source: typeSource,
    defaultValue: props.type ?? "Point",
  });
  const mapField = useInput({
    ...props,
    source: props.source,
  });

  const handleReset = (): void => {
    // _.set(
    //   value,
    //   typeSource,
    //   formData[typeSource] === "Point" ? "Polygon" : "Point"
    // );
    // _.set(value, coordinatesSource, []);
    mapField.field.onChange([]);
  };
  return (
    <>
      <SelectInput
        label="type"
        source={typeField.field.name}
        choices={[GeometryType.POINT, GeometryType.POLYGON].map((g) => ({
          id: g,
          name: g,
        }))}
        defaultValue={GeometryType.POINT}
        onChange={(e) => {
          typeField.field.onChange({ type: e.target.value, coordinates: [] });
        }}
      />
      <FormDataConsumer>
        {({ formData }) => {
          const type = _.get(formData, typeField.field.name);

          if (type === Polygon.type.props.type.value) {
            return (
              <MapInput
                {...props}
                type={type}
                source={props.source}
                onChange={mapField.field.onChange}
                value={mapField.field.value}
                onReset={handleReset}
              />
            );
          }

          return (
            <MapInput
              {...props}
              type={type}
              source={props.source}
              onChange={mapField.field.onChange}
              value={mapField.field.value}
              onReset={handleReset}
            />
          );
        }}
      </FormDataConsumer>
    </>
  );
};

export { MapInputWrapper as MapInput };
