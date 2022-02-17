import { GetLogger } from "@econnessione/core/logger";
import debug from "debug";

debug.enable(process.env.DEBUG);

const webLogger = GetLogger("web");

export const stateLogger = webLogger.extend("state");
