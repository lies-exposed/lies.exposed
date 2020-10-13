import * as t from "io-ts"

const LandUseUnit = t.union([t.literal("mq"), t.literal("kmq")])

const LandUsed = t.type(
  {
    area: t.number,
    unit: LandUseUnit,
  },
  "LandUsed"
)
const EmissionUnit = t.union([t.literal("t"), t.literal("gt")])

const CO2Emitted = t.type(
  {
    amount: t.number,
    unit: EmissionUnit,
  },
  "CO2Emitted"
)

const BiodiversityLoss = t.type(
  {
    specie: t.string,
    deaths: t.number,
  },
  "BiodiversityLoss"
)

export const Impact = t.union(
  [LandUsed, CO2Emitted, BiodiversityLoss],
  "Impact"
)
export type Impact = t.TypeOf<typeof Impact>
