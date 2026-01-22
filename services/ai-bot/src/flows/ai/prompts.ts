import { ACTORS } from "@liexp/io/lib/http/Actor.js";
import { EVENTS } from "@liexp/io/lib/http/Events/index.js";
import { GROUPS } from "@liexp/io/lib/http/Group.js";
import { LINKS } from "@liexp/io/lib/http/Link.js";
import { MEDIA } from "@liexp/io/lib/http/Media/Media.js";
import { OpenAICreateEventFromTextType } from "@liexp/io/lib/http/Queue/event/CreateEventFromTextQueueData.js";
import { OpenAICreateEventFromURLType } from "@liexp/io/lib/http/Queue/event/CreateEventFromURLQueue.js";
import {
  type OpenAIEmbeddingQueueType,
  type OpenAISummarizeQueueType,
  type Queue,
  type QueueResourceNames,
} from "@liexp/io/lib/http/Queue/index.js";
import { EMBED_ACTOR_PROMPT } from "@liexp/shared/lib/providers/openai/prompts/actor.prompts.js";
import {
  CREATE_EVENT_FROM_LINKS_PROMPT,
  CREATE_EVENT_FROM_TEXT_PROMPT,
  CREATE_EVENT_FROM_URL_PROMPT,
  EMBED_EVENT_PROMPT,
} from "@liexp/shared/lib/providers/openai/prompts/event.prompts.js";
import { EMBED_GROUP_SUMMARIZE_PROMPT } from "@liexp/shared/lib/providers/openai/prompts/group.prompts.js";
import { EMBED_LINK_PROMPT } from "@liexp/shared/lib/providers/openai/prompts/link.prompts.js";
import { EMBED_MEDIA_PROMPT } from "@liexp/shared/lib/providers/openai/prompts/media.prompts.js";
import { type PromptFn } from "@liexp/shared/lib/providers/openai/prompts/prompt.type.js";
import { Schema } from "effect";

export const getPromptFromResource = (
  resource: QueueResourceNames,
  _type: OpenAIEmbeddingQueueType | OpenAISummarizeQueueType,
): PromptFn<{ text: string }> => {
  switch (true) {
    case resource === ACTORS.literals[0]: {
      return EMBED_ACTOR_PROMPT;
    }
    case resource === GROUPS.literals[0]:
      return EMBED_GROUP_SUMMARIZE_PROMPT;
    case resource === LINKS.literals[0]:
      return EMBED_LINK_PROMPT;
    case resource === MEDIA.literals[0]:
      return EMBED_MEDIA_PROMPT;
    case resource === EVENTS.literals[0]: {
      return EMBED_EVENT_PROMPT;
    }
    default:
      return () => "Reply with fail";
  }
};

export const getPromptForJob = (
  job: Omit<Queue, "data" | "type"> & {
    type: OpenAIEmbeddingQueueType | OpenAISummarizeQueueType;
  },
) => {
  if (job.prompt) {
    return () => job.prompt!;
  }
  return getPromptFromResource(job.resource, job.type);
};

export const getEventFromJsonPrompt = (
  type: OpenAICreateEventFromTextType | OpenAICreateEventFromURLType,
) => {
  switch (true) {
    case Schema.is(OpenAICreateEventFromTextType)(type): {
      return CREATE_EVENT_FROM_TEXT_PROMPT;
    }

    case Schema.is(OpenAICreateEventFromURLType)(type): {
      return CREATE_EVENT_FROM_URL_PROMPT;
    }

    default:
      return () => "Reply with fail";
  }
};

export const getEventFromLinksPrompt = () => {
  return CREATE_EVENT_FROM_LINKS_PROMPT;
};
