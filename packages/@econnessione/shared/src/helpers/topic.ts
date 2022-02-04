import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import { Topic } from "../io/http";

export const getTopics = (
  topicUUIDs: string[],
  allTopics: Topic.TopicFrontmatter[]
): Topic.TopicFrontmatter[] => {
  const topicOption = (t: string): O.Option<Topic.TopicFrontmatter> =>
    O.fromNullable(allTopics.find((_) => S.Eq.equals(t, _.slug)));

  return pipe(A.map(topicOption)(topicUUIDs), A.compact);
};
