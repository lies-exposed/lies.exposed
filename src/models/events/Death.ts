import { ByGroupOrActor } from "@models/Common/ByGroupOrActor"
import { BaseFrontmatter } from "@models/Frontmatter"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"

export const Death = t.strict(
  {
    ...BaseFrontmatter.type.props,
    title: t.string,
    type: t.literal("Death"),
    who: ByGroupOrActor,
    killer: optionFromNullable(ByGroupOrActor),
    date: DateFromISOString,
  },
  "Death"
)

export type Death = t.TypeOf<typeof Death>