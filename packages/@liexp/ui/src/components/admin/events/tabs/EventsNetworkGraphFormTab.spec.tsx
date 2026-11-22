import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { DataProviderContext } from "../../../../context/DataProviderContext.js";
import { AdminContext, RecordContextProvider } from "../../react-admin.js";
import { EventsNetworkGraphFormTab } from "./EventsNetworkGraphFormTab.js";

// The graph box pulls in the endpoint-queries provider and d3 rendering; this
// spec only cares about how the Regenerate button builds its request. vi.mock
// is hoisted above imports by vitest, so the static import above stays valid.
vi.mock(
  "../../../../containers/graphs/EventsNetworkGraphBox/EventsNetworkGraphBox.js",
  () => ({
    EventsNetworkGraphBox: () => <div data-testid="events-network-graph-box" />,
  }),
);

interface PutCall {
  path: string;
  body: unknown;
}

const setup = (
  record: { id?: string } | undefined,
): { putCalls: PutCall[] } => {
  const putCalls: PutCall[] = [];
  const apiProvider = {
    put: vi.fn((path: string, body: unknown) => {
      putCalls.push({ path, body });
      return Promise.resolve({ data: record ?? {} });
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authProvider: any = {
    checkAuth: () => Promise.resolve(),
    checkError: () => Promise.resolve(),
    getPermissions: () => Promise.resolve([]),
  };

  render(
    <AdminContext dataProvider={apiProvider} authProvider={authProvider}>
      <DataProviderContext.Provider value={apiProvider}>
        <RecordContextProvider value={record}>
          <EventsNetworkGraphFormTab type="groups" />
        </RecordContextProvider>
      </DataProviderContext.Provider>
    </AdminContext>,
  );

  return { putCalls };
};

describe("EventsNetworkGraphFormTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("issues the regenerate PUT with the record id in the path", async () => {
    const { putCalls } = setup({ id: "02e042ca-c1b1-4a3f-be35-75a966d8b5b8" });

    await userEvent.click(
      await screen.findByRole("button", { name: /regenerate/i }),
    );

    expect(putCalls).toHaveLength(1);
    expect(putCalls[0]?.path).toBe(
      "networks/groups/02e042ca-c1b1-4a3f-be35-75a966d8b5b8",
    );
    expect(putCalls[0]?.body).toEqual({ regenerate: true });
  });

  test("never issues a request when the record has no id", async () => {
    const { putCalls } = setup(undefined);

    expect(
      screen.queryByRole("button", { name: /regenerate/i }),
    ).toBeNull();

    await userEvent.click(document.body);

    expect(putCalls).toHaveLength(0);
  });
});
