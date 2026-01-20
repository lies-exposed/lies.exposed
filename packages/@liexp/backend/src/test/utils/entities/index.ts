import { type Actor } from "@liexp/io/lib/http/Actor.js";
import { type Area } from "@liexp/io/lib/http/Area.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { type Group } from "@liexp/io/lib/http/Group.js";
import { type Keyword } from "@liexp/io/lib/http/Keyword.js";
import { type Link, type LinkMedia } from "@liexp/io/lib/http/Link.js";
import { Media } from "@liexp/io/lib/http/Media/Media.js";
import { type User } from "@liexp/io/lib/http/User.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import { Schema } from "effect";
import { type ActorEntity } from "../../../entities/Actor.entity.js";
import { type AreaEntity } from "../../../entities/Area.entity.js";
import { type GroupEntity } from "../../../entities/Group.entity.js";
import { type KeywordEntity } from "../../../entities/Keyword.entity.js";
import { type LinkEntity } from "../../../entities/Link.entity.js";
import { type MediaEntity } from "../../../entities/Media.entity.js";
import { type UserEntity } from "../../../entities/User.entity.js";

export const toActorEntity = (actor: Actor): ActorEntity => {
  return {
    ...actor,
    avatar: null,
    death: null,
    diedOn: null,
    memberIn: [],
    events: [],
    stories: [],
    nationalities: [],
    eventCount: 0,
    deletedAt: null,
    bornOn: null,
  };
};

export const toMediaEntity = (image: LinkMedia | Media): MediaEntity => {
  if (Schema.is(Media)(image)) {
    return {
      ...image,
      label: image.label ?? null,
      thumbnail: image.thumbnail ?? image.location,
      location: image.location,
      description: image.description ?? null,
      events: [],
      links: [],
      keywords: [],
      areas: [],
      stories: [],
      creator: null,
      extra: null,
      featuredInAreas: [],
      featuredInStories: [],
      socialPosts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
  }

  return {
    ...image,
    label: image.label ?? null,
    thumbnail: image.thumbnail ?? image.location,
    location: image.location,
    description: image.description ?? null,
    events: [],
    links: [],
    keywords: [],
    areas: [],
    stories: [],
    creator: null,
    extra: null,
    socialPosts: [],
    featuredInAreas: [],
    featuredInStories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
};

export const toLinkEntity = (a: Link): LinkEntity => ({
  ...a,
  title: a.title ?? a.url,
  description: a.description ?? null,
  publishDate: a.publishDate ?? null,
  provider: null,
  image: Schema.is(UUID)(a.image)
    ? a.image
    : a.image
      ? toMediaEntity(a.image)
      : null,
  url: sanitizeURL(a.url),
  creator: null,
  events: [],
  keywords: [],
  socialPosts: [],
  deletedAt: null,
});

export const toGroupEntity = ({
  subGroups: _subGroups,
  ...g
}: Group): GroupEntity => ({
  stories: [],
  ...g,
  username: g.username ?? null,
  avatar: g.avatar ? toMediaEntity(g.avatar) : null,
  startDate: g.startDate ?? null,
  endDate: g.endDate ?? null,
  members: [],
  deletedAt: g.deletedAt ?? null,
});

export const toAreaEntity = (a: Area): AreaEntity => ({
  ...a,
  socialPosts: [],
  featuredImage: null,
  media: [],
  events: [],
  deletedAt: a.deletedAt ?? null,
});

export const toUserEntity = (u: User): UserEntity => ({
  ...u,
  eventSuggestions: [],
  stories: [],
  links: [],
  media: [],
  graphs: [],
  passwordHash: "",
  deletedAt: null,
});

export const toKeywordEntity = (k: Keyword): KeywordEntity => ({
  ...k,
  media: [],
  links: [],
  events: [],
  stories: [],
  socialPosts: [],
  eventCount: 0,
  linkCount: 0,
  deletedAt: k.deletedAt ?? null,
});
