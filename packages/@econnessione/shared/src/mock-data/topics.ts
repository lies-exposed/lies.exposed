import { Topic } from "@io/http";
import { generateRandomColor } from "@utils/colors";
import uuid from "@utils/uuid";

// topics
export const firstTopic: Topic.TopicFrontmatter = {
  id: uuid(),
  type: "TopicFrontmatter",
  label: "First Topic",
  slug: "first-topic",
  color: generateRandomColor(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const secondTopic: Topic.TopicFrontmatter = {
  id: uuid(),
  type: "TopicFrontmatter",
  label: "Second Topic",
  slug: "second-topic",
  color: generateRandomColor(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const thirdTopic: Topic.TopicFrontmatter = {
  id: uuid(),
  type: "TopicFrontmatter",
  label: "Third Topic",
  slug: "third-topic",
  color: generateRandomColor(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const topics = [firstTopic, secondTopic, thirdTopic];
