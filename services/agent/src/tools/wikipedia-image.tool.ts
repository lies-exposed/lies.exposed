import { effectToZodObject } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect";
import { tool } from "langchain";
import { imageTypeFromUrl, searchWikipediaImageUrl } from "../cli/wikipedia.js";

const WikipediaImageInput = Schema.Struct({
  name: Schema.String.annotations({
    description:
      "Name of the person, group or topic to look up on Wikipedia (e.g. an actor's full name)",
  }),
});

/**
 * Local tool: resolve the main Wikipedia image for a name. The agent then
 * registers it with the MCP `createMedia` tool (location = imageUrl, type =
 * type) and uses the returned media id as an avatar.
 */
export const createWikipediaImageTool = () =>
  tool(
    async ({ name }: { name: string }): Promise<string> => {
      try {
        const imageUrl = await searchWikipediaImageUrl(name);
        return JSON.stringify({ imageUrl, type: imageTypeFromUrl(imageUrl) });
      } catch (e) {
        return `Error: Wikipedia image lookup failed for "${name}": ${
          e instanceof Error ? e.message : String(e)
        }`;
      }
    },
    {
      name: "find_wikipedia_image",
      description:
        "Find the main Wikipedia image URL for a person/group name. Returns JSON {imageUrl, type}. " +
        "To set an avatar: call this, then call createMedia with location=imageUrl and the returned type, " +
        "then pass the new media id as the avatar of createActor/editActor/createGroup/editGroup.",
      schema: effectToZodObject(WikipediaImageInput.fields),
    },
  );
