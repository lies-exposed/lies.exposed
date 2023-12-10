import { type TGBotProvider } from "@liexp/backend/lib/providers/tg/tg.provider.js";
import { type RouteContext } from "#routes/route.types.js";

export const helpCommand = ({
  logger,
  wp,
  tg,
  db,
  ...rest
}: RouteContext): TGBotProvider => {
  tg.api.onText(/\/help/, (msg, match) => {
    void tg.api.sendMessage(
      msg.chat.id,
      `
/actor [fullName]      Create new actor
/group [name]           Create new group
    `,
    );
  });
  return tg;
};
