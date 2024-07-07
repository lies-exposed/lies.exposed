import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Option, type Some } from "fp-ts/lib/Option.js";
import { Equal } from "typeorm";
import { SettingEntity } from "#entities/Setting.entity.js";
import { type TEFlow2 } from "#flows/flow.types.js";
import { NotFoundError, type ControllerError } from "#io/ControllerError.js";
import { type LangchainProvider } from "#providers/ai/langchain.provider.js";

interface OpenAISettings {
  value: { url: string };
}

const isLocalAIProxyUrl = (v: Option<unknown>): v is Some<OpenAISettings> => {
  const vv: any = v;
  const vvalue: any = vv?.value;
  return (
    fp.O.isSome(vv) && vvalue.value.url && typeof vvalue.value.url === "string"
  );
};

export const getLangchainProviderFlow: TEFlow2<{
  langchain: LangchainProvider;
  localAiProxyUrl: string;
}> = (ctx) => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  return pipe(
    fp.TE.Do,
    fp.TE.bind("localAiProxyUrl", () =>
      pipe(
        ctx.db.findOne(SettingEntity, {
          where: {
            id: Equal("local-ai-proxy-url"),
          },
        }),
        fp.TE.filterOrElse(
          (setting) => isLocalAIProxyUrl(setting),
          () => NotFoundError("Langchain not found"),
        ),
        fp.TE.map(
          (setting) => (setting as Some<OpenAISettings>).value.value.url,
        ),
      ),
    ),
    fp.TE.bind("langchain", ({ localAiProxyUrl }) => {
      return pipe(
        fp.TE.right<ControllerError, LangchainProvider>(
          ctx.langchain({
            baseURL: localAiProxyUrl,
          }),
        ),
      );
    }),
  );
};
