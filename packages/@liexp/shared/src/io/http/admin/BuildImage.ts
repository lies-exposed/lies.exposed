import * as t from "io-ts";
import { Color, MaybeURL } from "../Common/index.js";

const CommonImageLayerProps = t.strict(
  {
    blend: t.string,
    gravity: t.string,
    width: t.union([t.number, t.undefined]),
    height: t.union([t.number, t.undefined]),
    background: t.union([Color, t.undefined]),
  },
  "CommonLayerProps",
);

export const MediaImageLayerProps = t.strict(
  {
    type: t.literal("media"),
    url: MaybeURL,
  },
  "MediaImageLayerProps",
);

export type MediaImageLayerProps = t.TypeOf<typeof MediaImageLayerProps>;

export const MediaImageLayer = t.strict(
  {
    ...MediaImageLayerProps.type.props,
    ...CommonImageLayerProps.type.props,
  },
  "MediaImageLayer",
);

export type MediaImageLayer = t.TypeOf<typeof MediaImageLayer>;

export const TextLayerProps = t.strict(
  {
    type: t.literal("text"),
    text: t.string,
    color: t.union([Color, t.undefined]),
  },
  "TextLayer",
);
export type TextLayerProps = t.TypeOf<typeof TextLayerProps>;

export const TextLayer = t.strict(
  {
    ...TextLayerProps.type.props,
    ...CommonImageLayerProps.type.props,
  },
  "TextLayer",
);
export type TextLayer = t.TypeOf<typeof TextLayer>;

export const WatermarkLayerProps = t.strict(
  {
    type: t.literal("watermark"),
  },
  "WaterMarkLayerProps",
);
export type WatermarkLayerProps = t.TypeOf<typeof WatermarkLayerProps>;

export const WatermarkLayer = t.strict(
  {
    ...WatermarkLayerProps.type.props,
    ...CommonImageLayerProps.type.props,
  },
  "WaterMarkLayer",
);
export type WatermarkLayer = t.TypeOf<typeof WatermarkLayer>;

export const BuildImageLayer = t.union(
  [TextLayer, MediaImageLayer, WatermarkLayer],
  "BuildImageLayer",
);
export type BuildImageLayer = t.TypeOf<typeof BuildImageLayer>;
