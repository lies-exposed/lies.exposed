import { GetLogger } from "@liexp/core/lib/logger";

const webLogger = GetLogger("web");

export const stateLogger = webLogger.extend("state");
