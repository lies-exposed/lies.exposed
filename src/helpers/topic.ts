import { TopicFrontmatter } from "@models/topic"
import * as A from "fp-ts/lib/Array"
import { eqString } from "fp-ts/lib/Eq"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"

export const getTopics = (
  topicUUIDs: string[],
  allTopics: TopicFrontmatter[]
): TopicFrontmatter[] => {
  const topicOption = (t: string): O.Option<TopicFrontmatter> =>
    O.fromNullable(allTopics.find(_ => eqString.equals(t, _.slug)))

  return pipe(A.map(topicOption)(topicUUIDs), A.compact)
}
