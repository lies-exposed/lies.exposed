import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { type URL } from "../io/http/Common/index.js";
import { MediaType } from "../io/http/Media.js";

type Youtube = "youtube";
type Bitchute = "bitchute";
type OdySee = "odysee";
type Peertube = "peertube";
type Rumble = "rumble";
type DailyMotion = "dailymotion";

// type VideoPlatform = Youtube | Bitchute | OdySee | Peertube | Rumble;
export type VideoPlatformMatch =
  | {
      platform: Youtube | Bitchute;
      id: string;
    }
  | {
      platform: OdySee;
      firstId: string;
      secondId: string;
    }
  | {
      platform: Rumble;
      id: string;
      type: "embed" | "page";
    }
  | {
      platform: Peertube;
      host: string;
      id: string;
      type: "html";
    }
  | {
      platform: Peertube;
      host: string;
      id: string;
      type: "embed";
    }
  | {
      platform: DailyMotion;
      type: "embed";
      id: string;
    }
  | {
      platform: DailyMotion;
      type: "html";
      id: string;
    };

const ytVideoEmbedRegExp =
  /http(?:s?):\/\/(?:www\.)?youtube\.com\/embed\/([\w\-_]*)/;

const ytVideoRegExp =
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&(amp;)?[\w?=]*)?/;

const bitchuteVideoRegExp =
  /http(?:s?):\/\/(?:www\.)?bitchute\.com\/(video|embed)\/([\w\-_]*)/;

const odyseeVideoRegExp =
  /http(?:s?):\/\/(?:www\.)?odysee\.com\/\$\/(download|embed)\/([^/]+)\/([^/]+)$/;

const rumbleEmbedVideoRegExp =
  /http(?:s?):\/\/(?:www\.)?rumble\.com\/embed\/([\w\-_]*)\/?([\w?=]*)/;
const rumblePageVideoRegExp =
  /http(?:s?):\/\/(?:www\.)?rumble\.com\/([\w\-_]*)/;

const dailyMotionRegExp =
  /http(?:s?):\/\/(?:www\.)?dailymotion\.com\/embed\/video\/([\w\-_]*)/;

const dailyMotionRegExp2 =
  /http(?:s?):\/\/(?:www\.)?dailymotion\.com\/video\/([\w\-_]*)/;

const peertubeVideoRegExp =
  /http(?:s?):\/\/([^/]+)\/videos\/watch\/([^/]+)(&(amp;)?[\w?=]*)?/;
const peertubeEmbedVideoRegExp =
  /http(?:s?):\/\/([^/]+)\/videos\/embed\/([^/]+)(&(amp;)?[\w?=]*)?/;

const supportedPlatformsRegExp = [
  ytVideoRegExp,
  ytVideoEmbedRegExp,
  odyseeVideoRegExp,
  rumbleEmbedVideoRegExp,
  rumblePageVideoRegExp,
  peertubeVideoRegExp,
  dailyMotionRegExp,
  dailyMotionRegExp2,
];

export const getPlatform = (
  url: string,
): E.Either<Error, VideoPlatformMatch> => {
  // youtube
  const ytVideoMatch = url.match(ytVideoRegExp);
  if (ytVideoMatch !== null && typeof ytVideoMatch[1] === "string") {
    return E.right({ platform: "youtube", id: ytVideoMatch[1] });
  }

  const ytEmbedMatch = url.match(ytVideoEmbedRegExp);
  if (ytEmbedMatch !== null && typeof ytEmbedMatch[1] === "string") {
    return E.right({ platform: "youtube", id: ytEmbedMatch[1] });
  }

  const matchBitchute = url.match(bitchuteVideoRegExp);
  if (matchBitchute !== null && typeof matchBitchute[2] === "string") {
    return E.right({ platform: "bitchute", id: matchBitchute[2] });
  }

  // Odysee
  const odyseeMatch = url.match(odyseeVideoRegExp);
  if (
    typeof odyseeMatch?.[2] === "string" &&
    typeof odyseeMatch?.[3] === "string"
  ) {
    return E.right({
      platform: "odysee",
      firstId: odyseeMatch[1],
      secondId: odyseeMatch[2],
    });
  }

  // rumble
  const rumbleMatch = url.match(rumbleEmbedVideoRegExp);
  if (
    rumbleMatch &&
    t.string.is(rumbleMatch[1]) &&
    t.string.is(rumbleMatch?.[2])
  ) {
    return E.right({
      platform: "rumble",
      id: rumbleMatch[1],
      type: "embed",
    });
  }

  const rumblePageMatch = url.match(rumblePageVideoRegExp);
  if (rumblePageMatch) {
    return E.right({
      platform: "rumble",
      id: rumblePageMatch[1],
      type: "page",
    });
  }

  const dailyMotionMatch = url.match(dailyMotionRegExp);
  if (dailyMotionMatch) {
    return E.right({
      platform: "dailymotion",
      id: dailyMotionMatch[1],
      type: "embed",
    });
  }

  const dailyMotionMatch2 = url.match(dailyMotionRegExp2);
  if (dailyMotionMatch2) {
    return E.right({
      platform: "dailymotion",
      id: dailyMotionMatch2[1],
      type: "html",
    });
  }

  const peertubeMatch = url.match(peertubeVideoRegExp);

  if (
    typeof peertubeMatch?.[1] === "string" &&
    typeof peertubeMatch?.[2] === "string"
  ) {
    return E.right({
      platform: "peertube",
      host: peertubeMatch[1],
      id: peertubeMatch[2],
      type: "html",
    });
  }

  const peertubeEmbedMatch = url.match(peertubeEmbedVideoRegExp);

  if (
    typeof peertubeEmbedMatch?.[1] === "string" &&
    typeof peertubeEmbedMatch?.[2] === "string"
  ) {
    return E.right({
      platform: "peertube",
      host: peertubeEmbedMatch[1],
      id: peertubeEmbedMatch[2],
      type: "embed",
    });
  }

  return E.left(new Error(`URL not supported ${url}`));
};

export const getPlatformEmbedURL = (
  match: VideoPlatformMatch,
  url: URL,
): URL => {
  switch (match.platform) {
    case "bitchute": {
      return `https://www.bitchute.com/embed/${match.id}/` as URL;
    }
    case "odysee": {
      return `https://odysee.com/$/embed/${match.firstId}/${match.secondId}` as URL;
    }
    case "youtube": {
      return `https://www.youtube.com/embed/${match.id}` as URL;
    }

    case "peertube": {
      return `https://${match.host}/videos/embed/${match.id}` as URL;
    }
    case "rumble": {
      return `https://rumble.com/embed/${match.id}/?pub=7a20` as URL;
    }
    case "dailymotion": {
      return `https://dailymotion.com/embed/video/${match.id}/` as URL;
    }
    default: {
      return url;
    }
  }
};

export const parsePlatformURL = (url: URL): E.Either<Error, URL> => {
  return pipe(
    getPlatform(url),
    E.map((match) => getPlatformEmbedURL(match, url)),
  );
};

export const parseURL = (
  url: string,
): E.Either<Error, { type: MediaType; location: string }> => {
  if (url.includes(".jpg") ?? url.includes(".jpeg")) {
    return E.right({
      type: MediaType.types[1].value,
      location: url,
    });
  }

  if (url.includes(".png")) {
    return E.right({
      type: MediaType.types[2].value,
      location: url,
    });
  }

  if (url.includes(".pdf")) {
    return E.right({
      type: MediaType.types[6].value,
      location: url,
    });
  }

  if (url.includes(".mp4")) {
    return E.right({
      type: MediaType.types[5].value,
      location: url,
    });
  }

  const iframeVideosMatch = supportedPlatformsRegExp.some((v) => v.test(url));

  if (iframeVideosMatch) {
    return pipe(
      parsePlatformURL(url as any),
      E.map((location) => ({
        type: MediaType.types[7].value,
        location,
      })),
    );
  }

  return E.left(new Error(`No matching media for given url: ${url}`));
};
