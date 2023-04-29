import kebabCase from "lodash/kebabCase";

export const convertTitleToId = (t: string): string => {
  return kebabCase(t);
};

export const StoryUtils = { convertTitleToId };
