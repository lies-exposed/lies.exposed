import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/io/lib/http/Common/URL.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { type MediaType } from "@liexp/io/lib/http/Media/MediaType.js";
import { Schema } from "effect";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { uploadMediaFromURLFlow } from "../../../../flows/media/uploadMediaFromURL.flow.js";
import { formatMediaToMarkdown } from "../formatters/mediaToMarkdown.formatter.js";

/**
 * Find and download actor avatar from Wikipedia
 *
 * This tool searches Wikipedia for an actor by name, retrieves their profile image,
 * downloads and uploads it to storage, then returns the media ID for use with createActor.
 *
 * Usage flow:
 * 1. Call findActorAvatar with actor fullName
 * 2. Tool returns media ID and avatar URL
 * 3. Use the media ID in createActor config.avatar parameter
 */
export const FindActorAvatarInputSchema = Schema.Struct({
  fullName: Schema.String.annotations({
    description:
      "Full name of the actor to search for on Wikipedia (e.g., 'Barack Obama')",
  }),
  preferHighRes: Schema.UndefinedOr(Schema.Boolean).annotations({
    description:
      "Prefer high-resolution images over thumbnails if available (default: true)",
  }),
});
export type FindActorAvatarInputSchema = typeof FindActorAvatarInputSchema.Type;

export const findActorAvatarToolTask = ({
  fullName,
  preferHighRes,
}: FindActorAvatarInputSchema) => {
  return pipe(
    fp.RTE.ask<ServerContext>(),
    fp.RTE.chain((ctx) => {
      // Helper function to search Wikipedia and get avatar URL
      const searchWikipediaForAvatar = async (): Promise<URL> => {
        try {
          // Step 1: Search Wikipedia for the actor
          const searchResults = await ctx.wp.search(fullName)();
          if (searchResults._tag === "Left") {
            throw new Error(
              `No Wikipedia results found for "${fullName}". Try a more complete name.`,
            );
          }

          const results = searchResults.right;
          if (results.length === 0) {
            throw new Error(
              `No Wikipedia results found for "${fullName}". Try a more complete name.`,
            );
          }

          // Step 2: Get article summary with image
          const articleResult = await ctx.wp.articleSummary(results[0].title)();
          if (articleResult._tag === "Left") {
            throw new Error(
              `Failed to fetch Wikipedia article for "${results[0].title}"`,
            );
          }

          const article = articleResult.right;

          // Step 3: Extract image (prefer high-res)
          const shouldPreferHighRes = preferHighRes ?? true;
          const image = shouldPreferHighRes
            ? (article.originalimage ?? article.thumbnail)
            : (article.thumbnail ?? article.originalimage);

          if (!image) {
            throw new Error(
              `No image found on Wikipedia for "${article.title}"`,
            );
          }

          return image.source as URL;
        } catch (error) {
          throw new Error(
            error instanceof Error
              ? error.message
              : `Failed to find avatar for "${fullName}"`,
            { cause: error },
          );
        }
      };

      return pipe(
        fp.RTE.rightTask(() => searchWikipediaForAvatar()),
        fp.RTE.chain((url) =>
          uploadMediaFromURLFlow({
            id: uuid(),
            url,
            type: "Image" as MediaType,
            label: `${fullName} Avatar`,
            description: `Avatar/profile image for ${fullName} from Wikipedia`,
          }),
        ),
      );
    }),
    fp.RTE.chainEitherK((media) => MediaIO.decodeSingle(media)),
    fp.RTE.map((media) => ({
      content: [
        {
          text: formatMediaToMarkdown(media),
          type: "text" as const,
          href: `media://${media.id}`,
        },
      ],
    })),
  );
};
