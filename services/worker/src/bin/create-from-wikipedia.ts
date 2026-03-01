import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { type WikiProviders } from "@liexp/backend/lib/providers/wikipedia/types.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import prompts from "prompts";
import { Equal } from "typeorm";
import { fetchAndCreateActorFromWikipedia } from "../flows/actor/fetchAndCreateActorFromWikipedia.flow.js";
import { fetchAndCreateAreaFromWikipedia } from "../flows/area/fetchAndCreateAreaFromWikipedia.js";
import { fetchAndCreateGroupFromWikipedia } from "../flows/group/fetchGroupFromWikipedia.js";
import { type CommandFlow } from "./command.type.js";

/**
 * Usage create-from-wikipedia $type $search
 *
 * $type        type of entity to create  (actor|area|group)
 * $search      text used as query for wikipedia search api
 * $provider    wiki provider: 'wikipedia' | 'rationalwiki' (default 'wikipedia')
 *
 * @returns void
 */
export const createFromWikipedia: CommandFlow = async (ctx, args) => {
  const [type, search, provider = "wikipedia"] = args as [
    string,
    string,
    WikiProviders | undefined,
  ];

  if (!["area", "actor", "group"].includes(type)) {
    throw new Error(
      `Wrong type ${type} given. Allowed types are: 'actor', 'area', 'group'`,
    );
  }

  if (!search) {
    throw new Error('Missing "search" param');
  }

  const wpResult = await pipe(ctx.wp.search(search), throwTE);

  ctx.logger.debug.log("Search results %O", wpResult);

  if (wpResult.length === 0) {
    ctx.logger.info.log("No results found for '%s' on wikipedia", search);
    return;
  }

  const choice = await prompts({
    message: "Select correct page",
    type: "select",
    name: "page",
    choices: wpResult.map((r) => ({
      title: r.title,
      value: r.title,
    })),
  });

  if (!choice.page) {
    ctx.logger.info.log("No page selected, exiting.");
    return;
  }

  const pageTitle: string = choice.page;
  const slug = getUsernameFromDisplayName(pageTitle);

  // Check if the entity already exists before attempting creation
  let existingId: string | null;
  if (type === "actor") {
    const r = await pipe(
      ctx.db.findOne(ActorEntity, { where: { username: Equal(slug) } }),
      throwTE,
    );
    existingId = fp.O.isSome(r) ? r.value.id : null;
  } else if (type === "group") {
    const r = await pipe(
      ctx.db.findOne(GroupEntity, { where: { username: Equal(slug) } }),
      throwTE,
    );
    existingId = fp.O.isSome(r) ? r.value.id : null;
  } else {
    const r = await pipe(
      ctx.db.findOne(AreaEntity, { where: { label: Equal(pageTitle) } }),
      throwTE,
    );
    existingId = fp.O.isSome(r) ? r.value.id : null;
  }

  if (existingId) {
    ctx.logger.info.log(
      "Already exists: %s '%s' (id: %s)",
      type,
      pageTitle,
      existingId,
    );
    return;
  }

  if (type === "area") {
    const result = await pipe(
      fetchAndCreateAreaFromWikipedia(pageTitle, provider)(ctx),
      throwTE,
    );
    ctx.logger.info.log(
      "Created %s '%s' (id: %s)",
      type,
      pageTitle,
      result.area.id,
    );
  } else if (type === "group") {
    const result = await pipe(
      fetchAndCreateGroupFromWikipedia(pageTitle, provider)(ctx),
      throwTE,
    );
    ctx.logger.info.log("Created %s '%s' (id: %s)", type, pageTitle, result.id);
  } else {
    const result = await pipe(
      fetchAndCreateActorFromWikipedia(pageTitle, provider)(ctx),
      throwTE,
    );
    ctx.logger.info.log("Created %s '%s' (id: %s)", type, pageTitle, result.id);
  }
};
