import { GetLogger } from "@liexp/core/lib/logger/index.js";

const webLogger = GetLogger("web");

export const stateLogger = webLogger.extend("state");
