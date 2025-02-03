import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { EVENTS } from "@liexp/shared/lib/io/http/Events/index.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { LINKS } from "@liexp/shared/lib/io/http/Link.js";
import { MEDIA } from "@liexp/shared/lib/io/http/Media/Media.js";
import { OpenAICreateEventFromTextType } from "@liexp/shared/lib/io/http/Queue/CreateEventFromTextQueueData.js";
import { OpenAICreateEventFromURLType } from "@liexp/shared/lib/io/http/Queue/CreateEventFromURLQueue.js";
import {
  QueueTypes,
  type QueueResourceNames,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import {
  ACTOR_GENERAL_INFO_PROMPT,
  EMBED_ACTOR_PROMPT,
} from "@liexp/shared/lib/io/openai/prompts/actor.prompts.js";
import {
  CREATE_EVENT_FROM_URL_PROMPT,
  CREATE_EVENT_FROM_TEXT_PROMPT,
  EMBED_EVENT_PROMPT,
} from "@liexp/shared/lib/io/openai/prompts/event.prompts.js";
import { EMBED_GROUP_SUMMARIZE_PROMPT } from "@liexp/shared/lib/io/openai/prompts/group.prompts.js";
import { EMBED_LINK_PROMPT } from "@liexp/shared/lib/io/openai/prompts/link.prompts.js";
import { EMBED_MEDIA_PROMPT } from "@liexp/shared/lib/io/openai/prompts/media.prompts.js";

export const getPromptFromResource = (
  resource: QueueResourceNames,
  type: QueueTypes,
): string => {
  switch (true) {
    case resource === ACTORS.value: {
      if (type === QueueTypes.types[0].value) {
        return ACTOR_GENERAL_INFO_PROMPT;
      }
      return EMBED_ACTOR_PROMPT;
    }
    case resource === GROUPS.value:
      return EMBED_GROUP_SUMMARIZE_PROMPT;
    case resource === LINKS.value:
      return EMBED_LINK_PROMPT;
    case resource === MEDIA.value:
      return EMBED_MEDIA_PROMPT;
    case resource === EVENTS.value: {
      if (OpenAICreateEventFromTextType.is(type)) {
        return CREATE_EVENT_FROM_TEXT_PROMPT;
      }

      if (OpenAICreateEventFromURLType.is(type)) {
        return CREATE_EVENT_FROM_URL_PROMPT;
      }

      return EMBED_EVENT_PROMPT;
    }
    default:
      return "Reply with fail";
  }
};
