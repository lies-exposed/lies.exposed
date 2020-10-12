import * as Show from 'fp-ts/lib/Show'
import * as t from 'io-ts'

export const Project = t.type({
  name: t.string,
})

export type Project = t.TypeOf<typeof Project>

export const ProjectShow = Show.getStructShow({ name: Show.showString})

