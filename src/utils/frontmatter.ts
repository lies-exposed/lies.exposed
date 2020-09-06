import { Frontmatter } from "@models/Frontmatter"
import * as Eq from "fp-ts/lib/Eq"
import { pipe } from "fp-ts/lib/pipeable"

export const eqByUUID = pipe(
  Eq.eqString,
  Eq.contramap((f: Frontmatter) => f.uuid)
)
