/// <reference path="node-telegram-bot-api" />

declare module "bot-brother" {
  import TelegramBot from "node-telegram-bot-api";

  export type SessionManager = {};

  interface CommandContext {
    [key: string]: any;
    answer: any;
    args: string[];
    sendMessage: (m: string, opts?: any) => Promise<any>;
    updateText: (m: string) => Promise<any>;
    inlineKeyboard: (opts: any[]) => void;
    keyboard: (opts: any[]) => void;
    hideKeyboard: () => void;
  }

  type Command = {
    use: (hook: string, fn: (ctx: CommandContext) => Promise<void>) => Command;
    invoke: (fn: (ctx: CommandContext) => Promise<any>) => Command;
    answer: (fn: (ctx: CommandContext) => Promise<any>) => Command;
    callback: (fn: (ctx: CommandContext) => Promise<any>) => Command;
  };

  export type BotBrotherCtx = {
    api: TelegramBot;
    command: (command: string) => Command;
  };

  type BotBrotherOpts = {
    key: string;
    sessionManager: SessionManager;
    polling?:  boolean;
  };

  function bb(o: BotBrotherOpts): BotBrotherCtx;

  export const sessionManager = { memory: () => sessionManager };

  //   export default BotBrother;
  export = bb;
}
