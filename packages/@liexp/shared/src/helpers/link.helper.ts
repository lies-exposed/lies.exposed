import { URL } from "@io/http/Common";

const exludedURLs = [/http(?:s?):\/\/(?:www\.)?t\.me\/([\w\-_]*)/];

export const isExcludedURL = (url: URL) => {
  return exludedURLs.some((u) => u.test(url));
};
