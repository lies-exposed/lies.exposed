import * as t from "io-ts";

const LandUseUnit = t.union([t.literal("mq"), t.literal("kmq")], "LandUseUnit");

const LandUsed = t.strict(
  {
    type: t.literal("LandUsed"),
    area: t.number,
    unit: LandUseUnit,
  },
  "LandUsed"
);
const EmissionUnit = t.union([t.literal("t"), t.literal("gt")], "EmissionUnit");

const CO2Emitted = t.strict(
  {
    type: t.literal("CO2Emitted"),
    amount: t.number,
    unit: EmissionUnit,
  },
  "CO2Emitted"
);
const BIODIVERSITY_LOSS = t.literal("BiodiversityLoss");

export const BiodiversityLoss = t.strict(
  {
    type: BIODIVERSITY_LOSS,
    specie: t.string,
    deaths: t.number,
  },
  BIODIVERSITY_LOSS.value
);

export const Impact = t.union(
  [LandUsed, CO2Emitted, BiodiversityLoss],
  "Impact"
);
export type Impact = t.TypeOf<typeof Impact>;
