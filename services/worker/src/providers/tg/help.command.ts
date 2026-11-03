import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { type Message } from "node-telegram-bot-api";
import { type WorkerContext } from "#context/context.js";

export const helpCommand = ({
  logger: _logger,
  wp: _wp,
  tg,
  db: _db,
  ..._rest
}: WorkerContext): TGBotProvider => {
  tg.onText(/\/help/, (msg: Message, _match: RegExpExecArray | null) => {
    void tg.post(
      `
/login [email] [token]  Login with email and token
/actor [fullName]       Create new actor
/group [name]           Create new group
/area [name]            Create new area
/ask [question]         Ask the AI agent a question
    `,
      msg.message_id,
    );
  });
  return tg;
};
