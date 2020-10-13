import { TopicFrontmatter } from "@models/topic"
import { generateRandomColor } from "@utils/colors"
import uuid from '@utils/uuid'
import * as O from 'fp-ts/lib/Option'

// topics
export const firstTopic: TopicFrontmatter = {
  uuid: uuid(),
  label: "First Topic",
  slug: "first-topic",
  cover: O.none,
  color: generateRandomColor(),
  date: new Date(),
}

export const secondTopic: TopicFrontmatter = {
  uuid: uuid(),
  label: "Second Topic",
  slug: "second-topic",
  cover: O.none,
  color: generateRandomColor(),
  date: new Date(),
}

export const thirdTopic: TopicFrontmatter = {
  uuid: uuid(),
  label: "Third Topic",
  slug: "third-topic",
  cover: O.none,
  color: generateRandomColor(),
  date: new Date(),
}

export const topics = [firstTopic, secondTopic, thirdTopic]