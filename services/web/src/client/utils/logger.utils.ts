import { GetLogger } from "@liexp/core/logger";

const webLogger = GetLogger("web");

export const stateLogger = webLogger.extend("state");
