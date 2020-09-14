import * as t from 'io-ts'

export const ResourcesKeys = t.keyof({
  events: null,
  topics: null,
  actors: null,
  groups: null,
  articles: null
}, 'ResourcesKeys')

export type ResourcesKeys = t.TypeOf<typeof ResourcesKeys>