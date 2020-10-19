import { For } from "@models/Common/For"
import { ImageFileNode } from "@models/Image"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"

export const ProtestFrontmatter = t.strict(
  {
    uuid: t.string,
    type: t.literal("Protest"),
    for: For,
    images: optionFromNullable(nonEmptyArray(ImageFileNode)),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  },
  "Protest"
)

export type ProtestFrontmatter = t.TypeOf<typeof ProtestFrontmatter>
