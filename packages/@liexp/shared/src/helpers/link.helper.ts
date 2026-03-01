import { type URL } from "@liexp/io/lib/http/Common/index.js";

const excludedURLs = [
  // telegram profiles
  /http(?:s?):\/\/(?:www\.)?t\.me\/([\w\-_]*)/,
  // gab profiles
  /http(?:s?):\/\/(?:www\.)?gab\.com\/[^*]+$/,
  // minds profile
  /http(?:s?):\/\/(?:www\.)?minds\.com\/[^*]+$/,
  // rumble channels
  /http(?:s?):\/\/(?:www\.)?rumble\.com\/c\/[^*]+$/,
];

export const isPDFURL = (url: URL): boolean => {
  return /\.pdf(\?.*)?$/i.test(url);
};

export const isExcludedURL = (url: URL): boolean => {
  return excludedURLs.some((u) => u.test(url));
};
