import { fc } from "@liexp/test";
import type TelegramBot from "node-telegram-bot-api";

const TGFromArb = fc.record({
  id: fc.nat(),
  is_bot: fc.boolean(),
  first_name: fc.string(),
  last_name: fc.string(),
  username: fc.string(),
  language_code: fc.constant("en"),
});

const TGChatArb: fc.Arbitrary<TelegramBot.Chat> = fc.record({
  id: fc.nat(),
  first_name: fc.string(),
  last_name: fc.string(),
  username: fc.string(),
  type: fc.constant("private"),
});

export const TGPhotoArb: fc.Arbitrary<TelegramBot.PhotoSize> = fc.record({
  file_id: fc.base64String({ minLength: 16, maxLength: 16 }),
  file_unique_id: fc.base64String({ minLength: 16, maxLength: 16 }),
  file_size: fc.nat(),
  width: fc.constant(1024),
  height: fc.nat(),
});

const TGCaptionEntityArb: fc.Arbitrary<TelegramBot.MessageEntity> = fc.record({
  offset: fc.nat(),
  length: fc.nat(),
  type: fc.constant("text_link"),
  url: fc.webUrl(),
});

export const TGMessageArb: fc.Arbitrary<TelegramBot.Message> = fc.record({
  message_id: fc.nat(),
  from: TGFromArb,
  chat: TGChatArb,
  date: fc.date().map((d) => d.getTime()),
  forward_from_chat: fc.constant(undefined),
  forward_from_message_id: fc.nat(),
  forward_date: fc.date().map((d) => d.getTime()),
  forward_signature: fc.string(),
  photo: fc.array(TGPhotoArb),
  caption: fc.string(),
  caption_entities: fc.array(TGCaptionEntityArb),
});
