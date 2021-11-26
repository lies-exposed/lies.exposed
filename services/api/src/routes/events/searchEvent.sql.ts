import * as sql from "@databases/pg";

interface SearchEventsSQLInput {
  actors: string[];
  groups: string[];
  groupsMembers: string[];
  links: string[];
  keywords: string[];
  startDate: Date | undefined;
  endDate: Date | undefined;
  take: number;
  skip: number;
}

export const searchEventSQL = ({
  actors,
  groups,
  groupsMembers,
  links,
  keywords,
  startDate,
  endDate,
  take,
  skip,
}: SearchEventsSQLInput): sql.SQLQuery => {
  const eventGroupsJoin = sql.sql.__dangerous__rawValue(`
  ${
    groups.length > 0 ? "inner" : "left"
  } join "event_groups_group" "g" on "g"."eventId" = "event"."id" ${
    groups.length > 0
      ? ` AND "g"."groupId" IN (${groups.map((g) => `'${g}'`).join(",")})`
      : ``
  }
  `);

  const eventActorsJoin = sql.sql.__dangerous__rawValue(
    `${
      actors.length > 0 ? "inner" : "left"
    } join "event_actors_actor" "a" on "a"."eventId" = "event"."id" ${
      actors.length > 0
        ? ` AND "a"."actorId" IN (${actors.map((a) => `'${a}'`).join(",")})`
        : ``
    }`
  );

  const eventGroupsMembersJoin = sql.sql.__dangerous__rawValue(
    `${
      groupsMembers.length > 0 ? "inner" : "left"
    } join "event_groups_members_group_member" "gm" on "gm"."eventId" = "event"."id" ${
      groupsMembers.length > 0
        ? ` AND "gm"."groupMemberId" IN (${groupsMembers
            .map((a) => `'${a}'`)
            .join(",")})`
        : ``
    }`
  );

  const eventLinksJoin = sql.sql.__dangerous__rawValue(
    `${
      links.length > 0 ? "inner" : "left"
    } join "event_links_link" "l" on "l"."eventId" = "event"."id" ${
      links.length > 0
        ? ` AND "l"."linkId" IN (${links.map((a) => `'${a}'`).join(",")})`
        : ``
    }`
  );

  const eventKeywordsJoin = sql.sql.__dangerous__rawValue(
    `${
      keywords.length > 0 ? "inner" : "left"
    } join "event_keywords_keyword" "k" on "k"."eventId" = "event"."id" ${
      keywords.length > 0
        ? ` AND "k"."keywordId" IN (${keywords.map((a) => `'${a}'`).join(",")})`
        : ``
    }`
  );

  const eventsDateRangeWhere = sql.sql.__dangerous__rawValue(
    `${
      startDate !== undefined
        ? `AND "startDate" > '${startDate.toISOString()}'`
        : ""
    } ${
      endDate !== undefined
        ? `AND "endDate" < '${endDate.toISOString()}' OR "endDate" IS NULL`
        : ""
    }`
  );

  // deaths
  const deathWhere = sql.sql.__dangerous__rawValue(
    `${
      actors.length > 0
        ? `AND "death"."victimId" IN (${actors
            .map((a) => `'${a}'`)
            .join(",")}) `
        : ` `
    }`
  );

  const deathsStartDateRangeWhere = sql.sql.__dangerous__rawValue(
    startDate !== undefined ? `AND "date" > '${startDate.toISOString()}' ` : ``
  );
  const deathDateEndRangeWhere = sql.sql.__dangerous__rawValue(
    endDate !== undefined ? `AND "date" < '${endDate.toISOString()}'` : ""
  );
  // scientific studies
  const scientificStudiesActorsJoin = sql.sql.__dangerous__rawValue(`
  ${
    actors.length > 0 ? "inner" : "left"
  } join "scientific_study_authors_actor" "a" on "a"."scientificStudyId" = "study"."id" ${
    actors.length > 0
      ? ` AND "a"."actorId" IN (${actors.map((a) => `'${a}'`).join(",")})`
      : ``
  }
  `);

  const scientificStudiesPublisherWhere = sql.sql.__dangerous__rawValue(`
  ${
    groups.length > 0
      ? `AND "study"."publisherId" IN (${groups
          .map((a) => `'${a}'`)
          .join(",")})`
      : ``
  }
  `);

  const scientificStudyDateRangeWhere = sql.sql.__dangerous__rawValue(
    startDate !== undefined
      ? `AND "publishDate" > '${startDate.toISOString()}' ${
          endDate !== undefined
            ? `AND "publishDate" < '${endDate.toISOString()}'`
            : ""
        }`
      : ""
  );
  return sql.sql`select * from ((
    select
        "event"."id" as "id",
        count("event"."id") over() as "total_count",
        'event' as "type",
        "title" as "title",
        cast(null as text) as "url",
        array_agg("g"."groupId") as "groups",
        array_agg("a"."actorId") as "actors",
        array_agg("gm"."groupMemberId") as "groupsMembers",
        array_agg("l"."linkId") as "links",
        array_agg("k"."keywordId") as "keywords",
        array_agg("m"."imageId") as "media",
        cast(null as uuid) as "death_victim",
        "excerpt",
        "body",
        "body2" :: text,
        cast(null as date) as "death_date",
        cast("event"."startDate" as date) as "startDate",
        cast("event"."endDate" as date) as "endDate",
        cast("event"."createdAt" as date) as "createdAt",
        cast("event"."updatedAt" as date) as "updatedAt"
    from
        "event" "event"
        ${eventGroupsJoin}
        ${eventActorsJoin}
        ${eventGroupsMembersJoin}
        ${eventLinksJoin}
        ${eventKeywordsJoin}
        left join "event_media_image" "m" on "m"."eventId" = "event"."id"
    WHERE "event"."deletedAt" IS NULL
    ${eventsDateRangeWhere}
    group by
        "event"."id"
    order by
        "event"."startDate" DESC
)
union
all (
    select
        "death"."id" as "id",
        count("death"."id") over() as "total_count",
        'death' as "type",
        null as "title",
        cast(null as text) as "url",
        cast(array [] as uuid []) as "groups",
        cast(array [] as uuid []) as "actors",
        cast(array [] as uuid []) as "groupsMembers",
        cast(array [] as uuid []) as "links",
        cast(array [] as uuid []) as "keywords",
        cast(array [] as uuid []) as "media",
        "death"."victimId" as "death_victim",
        cast(null as varchar) as "excerpt",
        cast(null as varchar) as "body",
        null as "body2",
        cast("death"."date" as date) as "date",
        cast(null as date) as "startDate",
        cast(null as date) as "endDate",
        cast("death"."createdAt" as date) as "createdAt",
        cast("death"."updatedAt" as date) as "updatedAt"
    from
        "death_event" "death"
    WHERE "death"."deletedAt" IS NULL
    ${deathWhere} ${deathsStartDateRangeWhere} ${deathDateEndRangeWhere}
    group by "death"."id"
)
union
(
    select
        "study"."id" as "id",
        count("study"."id") over() as "total_count",
        'study' as "type",
        "title",
        "study"."url" as "url",
        cast(array [] as uuid []) as "groups",
        cast(array [] as uuid []) as "actors",
        cast(array [] as uuid []) as "groupsMembers",
        cast(array [] as uuid []) as "links",
        cast(array [] as uuid []) as "keywords",
        cast(array [] as uuid []) as "media",
        cast(null as uuid) as "death_victim",
        "excerpt",
        cast(null as varchar) as "body",
        null as "body2",
        cast("study"."publishDate" as date) as "death_date",
        cast(null as date) as "startDate",
        cast(null as date) as "endDate",
        cast("study"."createdAt" as date) as "createdAt",
        cast("study"."updatedAt" as date) as "updatedAt"
    from
        "scientific_study" "study"
    ${scientificStudiesActorsJoin}
    WHERE "study"."deletedAt" IS NULL
    ${scientificStudiesPublisherWhere}
    ${scientificStudyDateRangeWhere}
    group by "study"."id"
)) "all_events" ORDER BY "startDate" OFFSET ${skip} LIMIT ${take}`;
};
