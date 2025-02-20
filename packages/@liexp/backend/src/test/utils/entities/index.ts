import { type Actor } from "@liexp/shared/lib/io/http/Actor.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { type Group } from "@liexp/shared/lib/io/http/Group.js";
import { type Link, type LinkMedia } from "@liexp/shared/lib/io/http/Link.js";
import { Media } from "@liexp/shared/lib/io/http/Media/Media.js";
import { UUID } from "io-ts-types";
import { type ActorEntity } from "../../../entities/Actor.entity.js";
import { type GroupEntity } from "../../../entities/Group.entity.js";
import { type LinkEntity } from "../../../entities/Link.entity.js";
import { type MediaEntity } from "../../../entities/Media.entity.js";

export const toActorEntity = (actor: Actor): ActorEntity => {
  return {
    ...actor,
    old_avatar: null,
    avatar: null,
    death: null,
    diedOn: null,
    memberIn: [],
    events: [],
    stories: [],
    eventCount: 0,
    deletedAt: null,
    bornOn: null,
  };
};

export const toMediaEntity = (
  image: LinkMedia | Media | UUID,
): MediaEntity | UUID => {
  if (UUID.is(image)) {
    return image;
  }

  if (Media.is(image)) {
    return {
      ...image,
      label: image.label ?? null,
      thumbnail: (image.thumbnail ?? image.location) as URL,
      location: image.location as URL,
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
    thumbnail: (image.thumbnail ?? image.location) as URL,
    location: image.location as URL,
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
  image: UUID.is(a.image) ? a.image : a.image ? toMediaEntity(a.image) : null,
  creator: null,
  events: [],
  keywords: [],
  socialPosts: [],
  deletedAt: null,
});

export const toGroupEntity = ({ subGroups, ...g }: Group): GroupEntity => ({
  old_avatar: null,
  stories: [],
  ...g,
  username: g.username ?? null,
  avatar: g.avatar ? toMediaEntity(g.avatar) : null,
  startDate: g.startDate ?? null,
  endDate: g.endDate ?? null,
  members: [],
  deletedAt: g.deletedAt ?? null,
});
