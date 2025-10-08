import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { EVENTS } from "@liexp/shared/lib/io/http/Events/index.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { LINKS } from "@liexp/shared/lib/io/http/Link.js";
import { MEDIA } from "@liexp/shared/lib/io/http/Media/Media.js";
import { OpenAICreateEventFromTextType } from "@liexp/shared/lib/io/http/Queue/event/CreateEventFromTextQueueData.js";
import { OpenAICreateEventFromURLType } from "@liexp/shared/lib/io/http/Queue/event/CreateEventFromURLQueue.js";
import { OpenAIUpdateEventQueueType } from "@liexp/shared/lib/io/http/Queue/event/UpdateEventQueue.js";
import {
  type OpenAIEmbeddingQueueType,
  type OpenAISummarizeQueueType,
  type QueueResourceNames,
  type Queue,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import { EMBED_ACTOR_PROMPT } from "@liexp/shared/lib/io/openai/prompts/actor.prompts.js";
import {
  CREATE_EVENT_FROM_URL_PROMPT,
  CREATE_EVENT_FROM_TEXT_PROMPT,
  EMBED_EVENT_PROMPT,
} from "@liexp/shared/lib/io/openai/prompts/event.prompts.js";
import { EMBED_GROUP_SUMMARIZE_PROMPT } from "@liexp/shared/lib/io/openai/prompts/group.prompts.js";
import { EMBED_LINK_PROMPT } from "@liexp/shared/lib/io/openai/prompts/link.prompts.js";
import { EMBED_MEDIA_PROMPT } from "@liexp/shared/lib/io/openai/prompts/media.prompts.js";
import { type PromptFn } from "@liexp/shared/lib/io/openai/prompts/prompt.type.js";
import { Schema } from "effect";

export const getPromptFromResource = (
  resource: QueueResourceNames,
  _type: OpenAIEmbeddingQueueType | OpenAISummarizeQueueType,
): PromptFn<{ text: string; question: string }> => {
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
  type:
    | OpenAICreateEventFromTextType
    | OpenAICreateEventFromURLType
    | OpenAIUpdateEventQueueType,
) => {
  switch (true) {
    case Schema.is(OpenAICreateEventFromTextType)(type): {
      return CREATE_EVENT_FROM_TEXT_PROMPT;
    }

    case Schema.is(OpenAICreateEventFromURLType)(type):
    case Schema.is(OpenAIUpdateEventQueueType)(type): {
      return CREATE_EVENT_FROM_URL_PROMPT;
    }

    default:
      return () => "Reply with fail";
  }
};
