import { Schema } from "effect";

const LandUseUnit = Schema.Union(
  Schema.Literal("mq"),
  Schema.Literal("kmq"),
).annotations({
  title: "LandUseUnit",
});

const LandUsed = Schema.Struct({
  type: Schema.Literal("LandUsed"),
  area: Schema.Number,
  unit: LandUseUnit,
}).annotations({
  title: "LandUsed",
});
const EmissionUnit = Schema.Union(
  Schema.Literal("t"),
  Schema.Literal("gt"),
).annotations({
  title: "EmissionUnit",
});

const CO2Emitted = Schema.Struct({
  type: Schema.Literal("CO2Emitted"),
  amount: Schema.Number,
  unit: EmissionUnit,
}).annotations({
  title: "CO2Emitted",
});
const BIODIVERSITY_LOSS = Schema.Literal("BiodiversityLoss");

export const BiodiversityLoss = Schema.Struct({
  type: BIODIVERSITY_LOSS,
  specie: Schema.String,
  deaths: Schema.Number,
}).annotations({
  title: BIODIVERSITY_LOSS.Type,
});

export const Impact = Schema.Union(
  LandUsed,
  CO2Emitted,
  BiodiversityLoss,
).annotations({
  title: "Impact",
});
export type Impact = typeof Impact.Type;
