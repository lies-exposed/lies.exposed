import { ByEitherGroupOrActor } from "@models/Common/By"
import { ProjectFrontmatter } from "@models/Project"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"

export const FundFrontmatter = t.type(
  {
    uuid: t.string,
    // __type: t.literal('Fund'),
    amount: t.number,
    project: ProjectFrontmatter,
    by: ByEitherGroupOrActor,
    sources: t.array(t.string),
    date: DateFromISOString,
    createdAt: DateFromISOString
  },
  "FundFrontmatter"
)

export type FundFrontmatter = t.TypeOf<typeof FundFrontmatter>