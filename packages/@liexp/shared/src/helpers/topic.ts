import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as S from "fp-ts/lib/string.js";
import { type Topic } from "../io/http/index.js";

export const getTopics = (
  topicUUIDs: string[],
  allTopics: Topic.TopicFrontmatter[],
): Topic.TopicFrontmatter[] => {
  const topicOption = (t: string): O.Option<Topic.TopicFrontmatter> =>
    O.fromNullable(allTopics.find((_) => S.Eq.equals(t, _.slug)));

  return pipe(A.map(topicOption)(topicUUIDs), A.compact);
};
