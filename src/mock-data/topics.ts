import { TopicFrontmatter } from "@models/topic"
import { generateRandomColor } from "@utils/colors"
import uuid from '@utils/uuid'

// topics
export const firstTopic: TopicFrontmatter = {
  uuid: uuid(),
  label: "First Topic",
  slug: "first-topic",
  color: generateRandomColor(),
  date: new Date(),
}

export const secondTopic: TopicFrontmatter = {
  uuid: uuid(),
  label: "Second Topic",
  slug: "second-topic",
  color: generateRandomColor(),
  date: new Date(),
}

export const thirdTopic: TopicFrontmatter = {
  uuid: uuid(),
  label: "Third Topic",
  slug: "third-topic",
  color: generateRandomColor(),
  date: new Date(),
}

export const topics = [firstTopic, secondTopic, thirdTopic]