import { type load } from "exifreader";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";

export const exifRMock = mock<{ load: typeof load }>({
  load: vi.fn().mockRejectedValue(new Error("not implemented")),
});
