import { URL } from "@io/http/Common";

const exludedURLs = [/http(?:s?):\/\/(?:www\.)?t\.me\/([\w\-_]*)/];

export const isExcludedURL = (url: URL): boolean => {
  return exludedURLs.some((u) => u.test(url));
};
