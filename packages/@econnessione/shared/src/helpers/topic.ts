import * as A from "fp-ts/lib/Array";
import { eqString } from "fp-ts/lib/Eq";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { Topic } from "../io/http";

export const getTopics = (
  topicUUIDs: string[],
  allTopics: Topic.TopicFrontmatter[]
): Topic.TopicFrontmatter[] => {
  const topicOption = (t: string): O.Option<Topic.TopicFrontmatter> =>
    O.fromNullable(allTopics.find((_) => eqString.equals(t, _.slug)));

  return pipe(A.map(topicOption)(topicUUIDs), A.compact);
};
