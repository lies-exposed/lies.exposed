import { type EventResult } from '@flows/event-suggestion/createFromTGMessage.flow';

export const getThanksMessage = (eventSuggestion: EventResult, baseURL: string): string => {
    return  [
        "Thanks for your contribution! 🫶",
        "\n",

        eventSuggestion.link
          ? `Links: ${eventSuggestion.link.map(
              (l) => `${baseURL}/links/${l.id}\n`,
            )}`
          : null,

        eventSuggestion.photos.length > 0
          ? `Photos: ${eventSuggestion.photos.map(
              (m) => `${baseURL}/media/${m.id}\n`,
            )}`
          : null,
        eventSuggestion.areas.length > 0
          ? `Areas: ${eventSuggestion.areas.map(
              (m) => `${baseURL}/areas/${m.id}\n`,
            )}`
          : null,
        eventSuggestion.videos.length > 0
          ? `Videos: ${eventSuggestion.videos.map(
              (m) => `${baseURL}/media/${m.id}\n`,
            )}`
          : null,
      ].filter((m) => !!m).join("\n");
}