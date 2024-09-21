import { load } from "exifreader";
import { mock } from "vitest-mock-extended";

export const exifRMock = mock<{ load: typeof load }>({
  load: vi.fn().mockRejectedValue(new Error("not implemented")),
});
