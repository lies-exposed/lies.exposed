import * as t from 'io-ts'

export const ForProject = t.strict({
  __type: t.literal('ForProject'),
  uuid: t.string
}, 'ForProject')

export const ForEvent = t.strict({
  __type: t.literal('ForEvent'),
  uuid: t.string
}, 'ForEvent')

export const For = t.union([ForProject, ForEvent], 'For')
export type For = t.TypeOf<typeof For>