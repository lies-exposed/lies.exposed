import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as S from "fp-ts/string";
import { type Topic } from "../io/http/index.js";

export const getTopics = (
  topicUUIDs: string[],
  allTopics: Topic.TopicFrontmatter[],
): Topic.TopicFrontmatter[] => {
  const topicOption = (t: string): O.Option<Topic.TopicFrontmatter> =>
    O.fromNullable(allTopics.find((_) => S.Eq.equals(t, _.slug)));

  return pipe(A.map(topicOption)(topicUUIDs), A.compact);
};
