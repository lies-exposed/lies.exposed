import { Schema } from "effect";
import { Color, MaybeURL } from "../Common/index.js";

const CommonImageLayerProps = Schema.Struct({
  blend: Schema.String,
  gravity: Schema.String,
  width: Schema.Union(Schema.Number, Schema.Undefined),
  height: Schema.Union(Schema.Number, Schema.Undefined),
  background: Schema.Union(Color, Schema.Undefined),
}).annotations({
  title: "CommonLayerProps",
});

export const MediaImageLayerProps = Schema.Struct({
  type: Schema.Literal("media"),
  url: MaybeURL,
}).annotations({ title: "MediaImageLayerProps" });

export type MediaImageLayerProps = typeof MediaImageLayerProps.Type;

export const MediaImageLayer = Schema.extend(
  MediaImageLayerProps,
  CommonImageLayerProps,
).annotations({
  title: "MediaImageLayer",
});

export type MediaImageLayer = typeof MediaImageLayer.Type;

export const TextLayerProps = Schema.Struct({
  type: Schema.Literal("text"),
  text: Schema.String,
  color: Schema.Union(Color, Schema.Undefined),
}).annotations({
  title: "TextLayerProps",
});
export type TextLayerProps = typeof TextLayerProps.Type;

export const TextLayer = Schema.extend(
  TextLayerProps,
  CommonImageLayerProps,
).annotations({
  title: "TextLayer",
});
export type TextLayer = typeof TextLayer.Type;

export const WatermarkLayerProps = Schema.Struct({
  type: Schema.Literal("watermark"),
}).annotations({
  title: "WaterMarkLayerProps",
});
export type WatermarkLayerProps = typeof WatermarkLayerProps.Type;

export const WatermarkLayer = Schema.extend(
  WatermarkLayerProps,
  CommonImageLayerProps,
).annotations({
  title: "WaterMarkLayer",
});
export type WatermarkLayer = typeof WatermarkLayer.Type;

export const BuildImageLayer = Schema.Union(
  TextLayer,
  MediaImageLayer,
  WatermarkLayer,
).annotations({
  title: "BuildImageLayer",
});
export type BuildImageLayer = typeof BuildImageLayer.Type;
