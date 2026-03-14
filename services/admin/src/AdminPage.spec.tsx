/**
 * AdminPage spec — verifies that all expected resources are registered.
 *
 * Strategy: We render AdminPage with heavily-mocked dependencies and use a
 * lightweight `Resource` stub that records the `name` prop passed to it.
 * This avoids executing any lazy-loaded page component while still asserting
 * the resource-registration contract of AdminPage.
 */

import { render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AdminPage from "./AdminPage.js";

// ---------------------------------------------------------------------------
// vi.hoisted: capture registered resource names before any mock is applied
// ---------------------------------------------------------------------------
const { registeredResources, lazyPageMock } = vi.hoisted(() => {
  const registeredResources: string[] = [];
  const noop = () => null;
  const lazyPageMock = () => ({
    default: noop,
    PageCreate: noop,
    PageEdit: noop,
    PageList: noop,
    StoryCreate: noop,
    StoryEdit: noop,
    StoryList: noop,
    MediaCreate: noop,
    MediaCreateMany: noop,
    MediaEdit: noop,
    MediaList: noop,
    LinkCreate: noop,
    LinkList: noop,
    LinkEdit: noop,
    SocialPostEdit: noop,
    EventSuggestionEdit: noop,
    EventSuggestionList: noop,
    UserEdit: noop,
    GroupCreate: noop,
    GroupEdit: noop,
    GroupList: noop,
    GroupMemberCreate: noop,
    GroupMemberEdit: noop,
    GroupMemberList: noop,
    ActorRelationCreate: noop,
    ActorRelationEdit: noop,
    ActorRelationList: noop,
    KeywordCreate: noop,
    KeywordEdit: noop,
    KeywordList: noop,
    QueueCreate: noop,
    QueueEdit: noop,
    QueueList: noop,
    SettingCreate: noop,
    SettingEdit: noop,
    SettingList: noop,
    SocialPostCreate: noop,
    SocialPostList: noop,
    UserCreate: noop,
    UserList: noop,
    DocumentaryCreate: noop,
    DocumentaryEdit: noop,
    DocumentaryList: noop,
    QuoteCreate: noop,
    QuoteEdit: noop,
    QuoteList: noop,
    ScientificStudyCreate: noop,
    ScientificStudyEdit: noop,
    ScientificStudiesList: noop,
    TransactionCreate: noop,
    TransactionEdit: noop,
    TransactionList: noop,
    NationList: noop,
    NationEdit: noop,
    NationCreate: noop,
    AdminStats: noop,
  });
  return { registeredResources, lazyPageMock };
});

// ---------------------------------------------------------------------------
// Hooks used by AdminPage directly
// ---------------------------------------------------------------------------
vi.mock("@liexp/ui/lib/context/ThemeContext.js", () => ({
  useThemeMode: vi.fn(() => ({ resolvedMode: "light" })),
}));

vi.mock("@liexp/ui/lib/hooks/useDataProvider.js", () => ({
  useDataProvider: vi.fn(() => ({})),
}));

vi.mock("@liexp/ui/lib/client/api.js", () => ({
  GetAuthProvider: vi.fn(() => ({})),
}));

vi.mock("@liexp/ui/lib/i18n/i18n.provider.js", () => ({
  i18nProvider: {},
}));

vi.mock("./theme.js", () => ({
  createAdminThemeOptions: vi.fn(() => ({})),
}));

// ---------------------------------------------------------------------------
// Mock react-admin stubs that AdminPage uses at the top level
// ---------------------------------------------------------------------------
vi.mock("@liexp/ui/lib/components/admin/react-admin.js", () => ({
  Admin: ({ children }: React.PropsWithChildren) => (
    <div data-testid="admin-root">{children}</div>
  ),
  Resource: ({ name }: { name: string }) => {
    registeredResources.push(name);
    return <div data-testid={`resource-${name}`} />;
  },
  CustomRoutes: ({ children }: React.PropsWithChildren) => (
    <div data-testid="custom-routes">{children}</div>
  ),
  Layout: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Menu: Object.assign(
    ({ children }: React.PropsWithChildren) => <nav>{children}</nav>,
    {
      DashboardItem: () => null,
      ResourceItems: () => null,
    },
  ),
  Login: () => null,
  CheckForApplicationUpdate: () => null,
  AppBar: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  useRecordContext: vi.fn(() => null),
  useResourceContext: vi.fn(() => ""),
}));

// ---------------------------------------------------------------------------
// Mock MUI icons (prevent svg/canvas heavy loading)
// ---------------------------------------------------------------------------
vi.mock("@liexp/ui/lib/components/Common/Icons/index.js", () => ({
  ActorIcon: () => null,
  AreaIcon: () => null,
  BookEventIcon: () => null,
  DeathEventIcon: () => null,
  DocumentaryEventIcon: () => null,
  GraphIcon: () => null,
  GroupIcon: () => null,
  HashtagIcon: () => null,
  LinkIcon: () => null,
  NationIcon: () => null,
  PatentEventIcon: () => null,
  QuoteEventIcon: () => null,
  ScientificStudyEventIcon: () => null,
  SocialPostIcon: () => null,
  TransactionEventIcon: () => null,
  UncategorizedEventIcon: () => null,
  UserIcon: () => null,
}));

vi.mock("@liexp/ui/lib/components/mui/icons.js", () => ({
  Assignment: () => null,
  GroupsIcon: () => null,
  LightbulbIcon: () => null,
  PermMedia: () => null,
  PostAdd: () => null,
  QueueIcon: () => null,
  SettingsIcon: () => null,
}));

vi.mock("@liexp/ui/lib/components/mui/index.js", () => ({
  Box: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Grid: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Stack: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  Typography: ({ children }: React.PropsWithChildren) => (
    <span>{children}</span>
  ),
}));

// ---------------------------------------------------------------------------
// Mock VersionDisplay and local layout components
// ---------------------------------------------------------------------------
vi.mock("@liexp/ui/lib/components/VersionDisplay.js", () => ({
  VersionDisplay: () => null,
}));

vi.mock("./components/CustomAppBar.js", () => ({
  CustomAppBar: () => null,
}));

vi.mock("./components/chat/AdminChat.js", () => ({
  AdminChat: () => null,
}));

// ---------------------------------------------------------------------------
// Mock react-router (Route is used inside AdminPage JSX)
// ---------------------------------------------------------------------------
vi.mock("react-router", () => ({
  Route: () => null,
  useLocation: vi.fn(() => ({ pathname: "/" })),
}));

// ---------------------------------------------------------------------------
// Mock all lazily-imported page modules (synchronous factory — defined via vi.hoisted above)
// ---------------------------------------------------------------------------

vi.mock(
  "@liexp/ui/lib/components/admin/SocialPost/SocialPostEdit.js",
  lazyPageMock,
);
vi.mock(
  "@liexp/ui/lib/components/admin/events/suggestions/AdminEventSuggestion.js",
  lazyPageMock,
);
vi.mock("@liexp/ui/lib/components/admin/links/AdminLinks.js", lazyPageMock);
vi.mock("@liexp/ui/lib/components/admin/links/LinkEdit.js", lazyPageMock);
vi.mock("@liexp/ui/lib/components/admin/media/index.js", lazyPageMock);
vi.mock("@liexp/ui/lib/components/admin/stories/AdminStories.js", lazyPageMock);
vi.mock("@liexp/ui/lib/components/admin/user/UserEdit.js", lazyPageMock);
vi.mock("@liexp/ui/lib/components/admin/nations/AdminNations.js", lazyPageMock);
vi.mock("./pages/areas/AreaCreate.js", lazyPageMock);
vi.mock("./pages/areas/AreaEdit.js", lazyPageMock);
vi.mock("./pages/areas/AreaList.js", lazyPageMock);
vi.mock("./pages/events/EventEdit.js", lazyPageMock);
vi.mock("./pages/events/EventList.js", lazyPageMock);
vi.mock("./pages/graphs/GraphCreate.js", lazyPageMock);
vi.mock("./pages/graphs/GraphEdit.js", lazyPageMock);
vi.mock("./pages/graphs/GraphList.js", lazyPageMock);
vi.mock("./pages/AdminGroupMember.js", lazyPageMock);
vi.mock("./pages/AdminActorRelation.js", lazyPageMock);
vi.mock("./pages/AdminGroups.js", lazyPageMock);
vi.mock("./pages/AdminKeyword.js", lazyPageMock);
vi.mock("./pages/AdminQueue.js", lazyPageMock);
vi.mock("./pages/AdminSetting.js", lazyPageMock);
vi.mock("./pages/AdminSocialPost.js", lazyPageMock);
vi.mock("./pages/AdminUsers.js", lazyPageMock);
vi.mock("./pages/Pages.js", lazyPageMock);
vi.mock("./pages/dashboard/AdminStats.js", lazyPageMock);
vi.mock("./pages/events/documentary/AdminDocumentaryEvent.js", lazyPageMock);
vi.mock("./pages/events/quote/AdminQuoteEvent.js", lazyPageMock);
vi.mock(
  "./pages/events/scientificStudy/AdminScientificStudyEvent.js",
  lazyPageMock,
);
vi.mock("./pages/events/transaction/AdminTransactionEvent.js", lazyPageMock);
vi.mock("./pages/actors/ActorList.js", lazyPageMock);
vi.mock("./pages/actors/ActorCreate.js", lazyPageMock);
vi.mock("./pages/actors/ActorEdit.js", lazyPageMock);
vi.mock("./pages/events/book/BookCreate.js", lazyPageMock);
vi.mock("./pages/events/book/BookEdit.js", lazyPageMock);
vi.mock("./pages/events/book/BookList.js", lazyPageMock);
vi.mock("./pages/events/death/DeathCreate.js", lazyPageMock);
vi.mock("./pages/events/death/DeathEdit.js", lazyPageMock);
vi.mock("./pages/events/death/DeathList.js", lazyPageMock);
vi.mock("./pages/events/patent/PatentList.js", lazyPageMock);
vi.mock("./pages/events/patent/PatentCreate.js", lazyPageMock);
vi.mock("./pages/events/patent/PatentEdit.js", lazyPageMock);
vi.mock("./pages/events/AdminUncategorizedEvent.js", lazyPageMock);

// ---------------------------------------------------------------------------
// Expected resource names
// ---------------------------------------------------------------------------
const EXPECTED_RESOURCES = [
  "pages",
  "stories",
  "media",
  "links",
  "actors",
  "groups",
  "groups-members",
  "actor-relations",
  "areas",
  "graphs",
  "events/suggestions",
  "events",
  "books",
  "deaths",
  "scientific-studies",
  "patents",
  "documentaries",
  "quotes",
  "transactions",
  "keywords",
  "social-posts",
  "users",
  "settings",
  "nations",
  "queues",
] as const;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registeredResources.length = 0;
  });

  describe("Admin shell", () => {
    it("should render the Admin root element", () => {
      render(<AdminPage />);
      expect(screen.getByTestId("admin-root")).toBeInTheDocument();
    });

    it("should render CustomRoutes", () => {
      render(<AdminPage />);
      expect(screen.getByTestId("custom-routes")).toBeInTheDocument();
    });
  });

  describe("Resource registration", () => {
    it(`should register exactly ${EXPECTED_RESOURCES.length} resources`, () => {
      render(<AdminPage />);
      expect(registeredResources).toHaveLength(EXPECTED_RESOURCES.length);
    });

    it.each(EXPECTED_RESOURCES)(
      "should register resource: %s",
      (resourceName) => {
        render(<AdminPage />);
        expect(
          screen.getByTestId(`resource-${resourceName}`),
          `Expected resource "${resourceName}" to be registered`,
        ).toBeInTheDocument();
      },
    );
  });
});
