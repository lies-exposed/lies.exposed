import { mock } from "vitest-mock-extended";
import { type FSClient } from "../../providers/fs/fs.provider.js";

export const queueFSMock = mock<FSClient>();
