import { ImageFileNode } from '@models/Image'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types/lib/DateFromISOString'
import { nonEmptyArray } from 'io-ts-types/lib/nonEmptyArray'
import { optionFromNullable } from 'io-ts-types/lib/optionFromNullable'

export const Protest = t.strict({
  uuid: t.string,
  type: t.literal('Protest'),
  projectId: t.string,
  images: optionFromNullable(nonEmptyArray(ImageFileNode)),
  createdAt: DateFromISOString,
  updatedAt: DateFromISOString
}, 'Protest')

export type Protest = t.TypeOf<typeof Protest>