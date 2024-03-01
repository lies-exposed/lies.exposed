import { Polygon } from "@liexp/shared/lib/io/http/Common/Geometry/index.js";
import { http } from "@liexp/shared/lib/io/index.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import get from "lodash/get";
import type Feature from "ol/Feature.js";
import { type FeatureLike } from "ol/Feature.js";
import Map from "ol/Map.js";
import View from "ol/View.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { type Geometry } from "ol/geom.js";
import Draw from "ol/interaction/Draw.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { OSM as OSMSource, Vector as VectorSource } from "ol/source.js";
import * as React from "react";
import {
  Button,
  FormDataConsumer,
  SelectInput,
  useInput,
  type InputProps,
} from "react-admin";

const formatOptions = {
  dataProjection: "EPSG:4326",
  featureProjection: "EPSG:3857",
};
const getDefaultFormat = (): GeoJSON => new GeoJSON(formatOptions);

const getDefaultMap = (
  target: HTMLDivElement,
  featuresLayer: VectorLayer<VectorSource<any>>,
): Map => {
  return new Map({
    target,
    layers: [new TileLayer({ source: new OSMSource() }), featuresLayer],
    view: new View({ center: [0, 0], zoom: 2 }),
  });
};

type MapInputProps = InputProps & {
  type: http.Common.Geometry.Geometry["type"];
  value: http.Common.Geometry.Geometry;
  onReset: () => void;
};

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

      const maybeFeatures = value.coordinates
        ? (format.readFeature(value) as FeatureLike)
        : undefined;

      const features: Feature<Geometry>[] = maybeFeatures
        ? Array.isArray(maybeFeatures)
          ? maybeFeatures
          : [maybeFeatures as Feature<Geometry>]
        : [];

      const target = mapContainer.current;
      if (target) {
        const featuresSource = new VectorSource(
          maybeFeatures ? { features, wrapX: false } : { wrapX: true },
        );
        const featuresLayer = new VectorLayer(
          maybeFeatures ? { source: featuresSource } : {},
        );

        const map = getDefaultMap(target, featuresLayer);
        if (features.length > 0) {
          map.getView().fit(featuresSource.getExtent(), {
            maxZoom: 12,
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
              format.writeGeometry(geometry, writeOptions),
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
        <Button
          label="reset"
          variant="outlined"
          onClick={() => {
            onReset();
          }}
        />
      </div>
    </>
  );
};

const MapInputWrapper: React.FC<
  Omit<MapInputProps, "value" | "type" | "onReset"> & {
    type?: MapInputProps["type"];
  }
> = (props) => {
  const typeSource = `${props.source}.type`;
  const typeField = useInput({
    ...props,
    source: typeSource,
    defaultValue: props?.type ?? "Point",
  });
  const mapField = useInput({
    ...props,
    source: props.source,
    defaultValue: [],
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
        choices={http.Common.Geometry.Geometry.types.map((g) => ({
          id: g.type.props.type.value,
          name: g.type.props.type.value,
        }))}
        defaultValue={http.Common.Geometry.Point.type.props.type.value}
        onChange={(e) => {
          typeField.field.onChange({ type: e.target.value, coordinates: [] });
        }}
      />
      <FormDataConsumer>
        {({ formData }) => {
          const type =
            get(formData, typeField.field.name) ?? typeField.field.value;

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
