import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'

export const BASE_FRONTMATTER = "BaseFrontmatter"
export const BaseFrontmatter = t.strict({
  id: t.string,
  type: t.string,
  createdAt: DateFromISOString,
  updatedAt: DateFromISOString
}, BASE_FRONTMATTER)

export type BaseFrontmatter = t.TypeOf<typeof BaseFrontmatter>