
import * as t from "io-ts"

export const Position = t.tuple([t.number, t.number], "PositionIO")
export type Position = t.TypeOf<typeof Position>