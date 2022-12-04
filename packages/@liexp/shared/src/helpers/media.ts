import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { URL } from "@io/http/Common";

type Youtube = "youtube";
type Bitchute = "bitchute";
type OdySee = "odysee";
type Peertube = "peertube";
type Rumble = "rumble";
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
    }
  | {
      platform: Peertube;
      host: string;
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

const rumbleVideoRegExp =
  /http(?:s?):\/\/(?:www\.)?rumble\.com\/embed\/([\w\-_]*)\/?([\w?=]*)/;
const rumbleVideoRegExp2 = /http(?:s?):\/\/(?:www\.)?rumble\.com\/([\w\^-_]*)/;

const peertubeVideoRegExp =
  /http(?:s?):\/\/([^/]+)\/videos\/watch\/([^/]+)(&(amp;)?[\w?=]*)?/;

export const getPlatform = (
  url: string
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
  const rumbleMatch = url.match(rumbleVideoRegExp);
  if (
    t.string.is(rumbleMatch?.[1]) &&
    t.string.is(rumbleMatch?.[2]) &&
    rumbleMatch?.[2].startsWith("?pub=")
  ) {
    return E.right({
      platform: "rumble",
      id: rumbleMatch[1],
    });
  }
  const rumbleMatch2 = url.match(rumbleVideoRegExp2);
  console.log(rumbleMatch2);

  if (rumbleMatch2) {
    return E.right({
      platform: "rumble",
      id: rumbleMatch2[1],
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
    });
  }

  return E.left(new Error(`URL not supported ${url}`));
};

export const getPlatformEmbedURL = (
  match: VideoPlatformMatch,
  url: URL
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
    default: {
      return url;
    }
  }
};

export const parsePlatformURL = (url: URL): E.Either<Error, URL> => {
  return pipe(
    getPlatform(url),
    E.map((match) => getPlatformEmbedURL(match, url))
  );
};
