import * as io from "@econnessione/shared/io";
import { URL, UUID } from "@econnessione/shared/io/http/Common";
import { uuid } from "@econnessione/shared/utils/uuid";

interface SearchEventEntity {
  id: string;
  type: "death" | "study" | "event";
  // uncategorized
  title: string;
  excerpt: string | null;
  startDate: string;
  endDate: string | null;
  groups: UUID[];
  actors: UUID[];
  groupsMembers: UUID[];
  links: UUID[];
  media: UUID[];
  keywords: UUID[];
  // death
  death_date: string;
  death_victim: UUID | null;
  // scientific study
  url: URL;
  publisher: UUID | null;
  createdAt: string;
  updatedAt: string;
}

export const toSearchEventIO = (
  e: SearchEventEntity
): io.http.Events.SearchEvent => {
  if (e.type === "death") {
    return {
      id: e.id as any,
      killer: undefined,
      location: undefined,
      victim: e.death_victim as any,
      type: "Death",
      date: new Date(e.death_date),
      news: [],
      suspects: [],
      media: [],
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt),
    };
  }

  if (e.type === "study") {
    return {
      ...e,
      id: e.id as any,
      type: "ScientificStudy",
      authors: [],
      publisher: uuid() as any,
      body: {},
      results: "",
      abstract: "",
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt),
      publishDate: new Date(e.death_date),
    };
  }

  return {
    ...e,
    id: e.id as any,
    type: "Uncategorized",
    location: undefined,
    startDate: new Date(e.startDate),
    endDate: e.endDate ? new Date(e.endDate) : undefined,
    groups: e.groups.filter((g: any) => g !== null),
    actors: e.actors.filter((a: any) => a !== null),
    groupsMembers: e.groupsMembers.filter((a: any) => a !== null),
    keywords: e.keywords.filter((a: any) => a !== null),
    links: e.links.filter((a: any) => a !== null),
    media: e.media.filter((a: any) => a !== null),
    createdAt: new Date(e.createdAt),
    updatedAt: new Date(e.updatedAt),
  };
};

