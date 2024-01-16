import { CustomProjection, Graticule } from "@visx/geo";
import {
  type ProjectionProps,
  type ParsedFeature,
} from "@visx/geo/lib/projections/Projection.js";
import { type GeoPermissibleObjects } from "@visx/geo/lib/types.js";
import { scaleQuantize } from "@visx/scale";
import { Zoom } from "@visx/zoom";
import * as React from "react";
import * as topojson from "topojson-client";
// eslint-disable-next-line import/no-unresolved
import type { Topology, GeometryCollection } from "topojson-specification";
import worldTopology from "./world-topo.json";

export const mapBackground = "#FFF";

interface WorldFeatureShapeProps {
  name: string;
}

const worldTopologyTyped: Topology<{
  units: GeometryCollection<WorldFeatureShapeProps>;
}> = worldTopology as any;

export interface GeoCustomProps<P extends GeoJSON.GeoJsonProperties> {
  width: number;
  height: number;
  data: GeoJSON.FeatureCollection<GeoJSON.Geometry, P>;
  projection: ProjectionProps["projection"];
  featureRenderer: (f: ParsedFeature<P>, i: number) => JSX.Element;
}

const world = topojson.feature(
  worldTopologyTyped,
  worldTopologyTyped.objects.units,
);

const color = scaleQuantize({
  domain: [1, 100],
  range: [
    "#fff",
    // "#ffa020",
    // "#ff9221",
    // "#ff8424",
    // "#ff7425",
    // "#fc5e2f",
    // "#f94b3a",
    // "#f63a48",
  ],
});

const GeoCustom: any = <P extends GeoPermissibleObjects>({
  width,
  height,
  projection,
  data,
  featureRenderer,
}: GeoCustomProps<P>): JSX.Element => {
  const centerX = width / 2;
  const centerY = height / 2;
  const initialScale = (width / 630) * 100;

  return (
    <div style={{ height, width, marginLeft: "auto", marginRight: "auto" }}>
      <Zoom
        width={width}
        height={height}
        scaleXMin={100}
        scaleXMax={1000}
        scaleYMin={100}
        scaleYMax={1000}
        initialTransformMatrix={{
          scaleX: initialScale,
          scaleY: initialScale,
          translateX: centerX,
          translateY: centerY,
          skewX: 0,
          skewY: 0,
        }}
      >
        {(zoom) => (
          <div style={{ position: "relative" }}>
            <svg
              width={width}
              height={height}
              className={zoom.isDragging ? "dragging" : undefined}
            >
              <rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill={mapBackground}
                rx={14}
              />
              <CustomProjection<any>
                projection={projection}
                data={world.features}
                scale={zoom.transformMatrix.scaleX}
                translate={[
                  zoom.transformMatrix.translateX,
                  zoom.transformMatrix.translateY,
                ]}
              >
                {(mercator) => {
                  return (
                    <g>
                      <Graticule
                        graticule={(g) => mercator.path(g) ?? ""}
                        stroke="rgba(33,33,33,0.05)"
                      />
                      {mercator.features.map(({ feature, path }, i) => {
                        return (
                          <path
                            key={`map-feature-${i}`}
                            d={path ?? ""}
                            stroke={"black"}
                            strokeWidth={0.5}
                            fill={color(feature.geometry.coordinates.length)}
                          />
                        );
                      })}
                    </g>
                  );
                }}
              </CustomProjection>
              <CustomProjection<any>
                projection={projection}
                data={data.features}
                scale={zoom.transformMatrix.scaleX}
                translate={[
                  zoom.transformMatrix.translateX,
                  zoom.transformMatrix.translateY,
                ]}
              >
                {(mercator) => {
                  return <g>{mercator.features.map(featureRenderer)}</g>;
                }}
              </CustomProjection>
              <rect
                x={0}
                y={0}
                width={width}
                height={height}
                rx={14}
                fill="transparent"
                onTouchStart={zoom.dragStart}
                onTouchMove={zoom.dragMove}
                onTouchEnd={zoom.dragEnd}
                onMouseDown={zoom.dragStart}
                onMouseMove={zoom.dragMove}
                onMouseUp={zoom.dragEnd}
                onMouseLeave={() => {
                  if (zoom.isDragging) zoom.dragEnd();
                }}
              />
            </svg>
            <div
              className="controls"
              style={{ position: "absolute", right: 10, bottom: 0 }}
            >
              <button
                className="btn btn-zoom"
                onClick={() => {
                  zoom.scale({ scaleX: 1.2, scaleY: 1.2 });
                }}
              >
                +
              </button>
              <button
                className="btn btn-zoom btn-bottom"
                onClick={() => {
                  zoom.scale({ scaleX: 0.8, scaleY: 0.8 });
                }}
              >
                -
              </button>
              <button className="btn btn-lg" onClick={zoom.reset}>
                Reset
              </button>
            </div>
          </div>
        )}
      </Zoom>
    </div>
  );
};

export default GeoCustom;
