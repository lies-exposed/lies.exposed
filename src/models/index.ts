import * as t from 'io-ts'

export const ResourcesNames = t.keyof({
  events: null,
  topics: null,
  actors: null,
  groups: null,
  articles: null,
  areas: null,
  projects: null
}, 'ResourcesNames')

export type ResourcesNames = t.TypeOf<typeof ResourcesNames>