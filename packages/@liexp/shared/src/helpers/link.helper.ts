import { URL } from "../io/http/Common";

const excludedURLs = [/http(?:s?):\/\/(?:www\.)?t\.me\/([\w\-_]*)/];

export const isExcludedURL = (url: URL): boolean => {
  return excludedURLs.some((u) => u.test(url));
};
