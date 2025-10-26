import { GetAuthProvider } from "@liexp/ui/lib/client/api.js";
import {
  ActorIcon,
  AreaIcon,
  BookEventIcon,
  DeathEventIcon,
  DocumentaryEventIcon,
  GraphIcon,
  GroupIcon,
  HashtagIcon,
  LinkIcon,
  NationIcon,
  PatentEventIcon,
  QuoteEventIcon,
  ScientificStudyEventIcon,
  SocialPostIcon,
  TransactionEventIcon,
  UncategorizedEventIcon,
  UserIcon,
} from "@liexp/ui/lib/components/Common/Icons/index.js";
import {
  Admin,
  CheckForApplicationUpdate,
  CustomRoutes,
  Layout,
  Login,
  Menu,
  Resource,
  type LayoutProps,
  type MenuProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import {
  Assignment as AssignmentIcon,
  PermMedia as PermMediaIcon,
  PostAdd as PostAddIcon,
} from "@liexp/ui/lib/components/mui/icons.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import { i18nProvider } from "@liexp/ui/lib/i18n/i18n.provider.js";
import * as React from "react";
import { Route } from "react-router";

import { adminThemeOptions } from "./theme.js";

// Lazy loading helper removed - components now use direct React.lazy or individual files

// Lazy loaded UI components
const SocialPostEdit = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/SocialPost/SocialPostEdit.js").then(
    (m) => ({ default: m.SocialPostEdit }),
  ),
);

const EventSuggestionEdit = React.lazy(() =>
  import(
    "@liexp/ui/lib/components/admin/events/suggestions/AdminEventSuggestion.js"
  ).then((m) => ({ default: m.EventSuggestionEdit })),
);

const EventSuggestionList = React.lazy(() =>
  import(
    "@liexp/ui/lib/components/admin/events/suggestions/AdminEventSuggestion.js"
  ).then((m) => ({ default: m.EventSuggestionList })),
);

const LinkCreate = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/links/AdminLinks.js").then((m) => ({
    default: m.LinkCreate,
  })),
);

const LinkList = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/links/AdminLinks.js").then((m) => ({
    default: m.LinkList,
  })),
);

const LinkEdit = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/links/LinkEdit.js").then((m) => ({
    default: m.LinkEdit,
  })),
);

const MediaCreate = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/media/index.js").then((m) => ({
    default: m.MediaCreate,
  })),
);

const MediaCreateMany = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/media/index.js").then((m) => ({
    default: m.MediaCreateMany,
  })),
);

const MediaEdit = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/media/index.js").then((m) => ({
    default: m.MediaEdit,
  })),
);

const MediaList = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/media/index.js").then((m) => ({
    default: m.MediaList,
  })),
);

const StoryCreate = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/stories/AdminStories.js").then(
    (m) => ({ default: m.StoryCreate }),
  ),
);

const StoryEdit = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/stories/AdminStories.js").then(
    (m) => ({ default: m.StoryEdit }),
  ),
);

const StoryList = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/stories/AdminStories.js").then(
    (m) => ({ default: m.StoryList }),
  ),
);

const UserEdit = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/user/UserEdit.js").then((m) => ({
    default: m.UserEdit,
  })),
);

const AreaCreate = React.lazy(() => import("./pages/areas/AreaCreate.js"));

const AreaEdit = React.lazy(() => import("./pages/areas/AreaEdit.js"));

const AreaList = React.lazy(() => import("./pages/areas/AreaList.js"));

const EventEdit = React.lazy(() => import("./pages/events/EventEdit.js"));

const EventList = React.lazy(() => import("./pages/events/EventList.js"));

const GraphCreate = React.lazy(() => import("./pages/graphs/GraphCreate.js"));

const GraphEdit = React.lazy(() => import("./pages/graphs/GraphEdit.js"));

const GraphList = React.lazy(() => import("./pages/graphs/GraphList.js"));

const GroupMemberCreate = React.lazy(() =>
  import("./pages/AdminGroupMember.js").then((m) => ({
    default: m.GroupMemberCreate,
  })),
);

const GroupMemberEdit = React.lazy(() =>
  import("./pages/AdminGroupMember.js").then((m) => ({
    default: m.GroupMemberEdit,
  })),
);

const GroupMemberList = React.lazy(() =>
  import("./pages/AdminGroupMember.js").then((m) => ({
    default: m.GroupMemberList,
  })),
);

const GroupCreate = React.lazy(() =>
  import("./pages/AdminGroups.js").then((m) => ({ default: m.GroupCreate })),
);

const GroupEdit = React.lazy(() =>
  import("./pages/AdminGroups.js").then((m) => ({ default: m.GroupEdit })),
);

const GroupList = React.lazy(() =>
  import("./pages/AdminGroups.js").then((m) => ({ default: m.GroupList })),
);

const KeywordCreate = React.lazy(() =>
  import("./pages/AdminKeyword.js").then((m) => ({
    default: m.KeywordCreate,
  })),
);

const KeywordEdit = React.lazy(() =>
  import("./pages/AdminKeyword.js").then((m) => ({ default: m.KeywordEdit })),
);

const KeywordList = React.lazy(() =>
  import("./pages/AdminKeyword.js").then((m) => ({ default: m.KeywordList })),
);

const QueueCreate = React.lazy(() =>
  import("./pages/AdminQueue.js").then((m) => ({ default: m.QueueCreate })),
);

const QueueEdit = React.lazy(() =>
  import("./pages/AdminQueue.js").then((m) => ({ default: m.QueueEdit })),
);

const QueueList = React.lazy(() =>
  import("./pages/AdminQueue.js").then((m) => ({ default: m.QueueList })),
);

const SettingCreate = React.lazy(() =>
  import("./pages/AdminSetting.js").then((m) => ({
    default: m.SettingCreate,
  })),
);

const SettingEdit = React.lazy(() =>
  import("./pages/AdminSetting.js").then((m) => ({ default: m.SettingEdit })),
);

const SettingList = React.lazy(() =>
  import("./pages/AdminSetting.js").then((m) => ({ default: m.SettingList })),
);

const SocialPostCreate = React.lazy(() =>
  import("./pages/AdminSocialPost.js").then((m) => ({
    default: m.SocialPostCreate,
  })),
);

const SocialPostList = React.lazy(() =>
  import("./pages/AdminSocialPost.js").then((m) => ({
    default: m.SocialPostList,
  })),
);

const UserCreate = React.lazy(() =>
  import("./pages/AdminUsers.js").then((m) => ({ default: m.UserCreate })),
);

const UserList = React.lazy(() =>
  import("./pages/AdminUsers.js").then((m) => ({ default: m.UserList })),
);

const PageCreate = React.lazy(() =>
  import("./pages/Pages.js").then((m) => ({ default: m.PageCreate })),
);

const PageEdit = React.lazy(() =>
  import("./pages/Pages.js").then((m) => ({ default: m.PageEdit })),
);

const PageList = React.lazy(() =>
  import("./pages/Pages.js").then((m) => ({ default: m.PageList })),
);

const AdminStats = React.lazy(() =>
  import("./pages/dashboard/AdminStats.js").then((m) => ({
    default: m.AdminStats,
  })),
);
const DocumentaryCreate = React.lazy(() =>
  import("./pages/events/documentary/AdminDocumentaryEvent.js").then((m) => ({
    default: m.DocumentaryCreate,
  })),
);

const DocumentaryEdit = React.lazy(() =>
  import("./pages/events/documentary/AdminDocumentaryEvent.js").then((m) => ({
    default: m.DocumentaryEdit,
  })),
);

const DocumentaryList = React.lazy(() =>
  import("./pages/events/documentary/AdminDocumentaryEvent.js").then((m) => ({
    default: m.DocumentaryList,
  })),
);

const QuoteCreate = React.lazy(() =>
  import("./pages/events/quote/AdminQuoteEvent.js").then((m) => ({
    default: m.QuoteCreate,
  })),
);

const QuoteEdit = React.lazy(() =>
  import("./pages/events/quote/AdminQuoteEvent.js").then((m) => ({
    default: m.QuoteEdit,
  })),
);

const QuoteList = React.lazy(() =>
  import("./pages/events/quote/AdminQuoteEvent.js").then((m) => ({
    default: m.QuoteList,
  })),
);

const ScientificStudyCreate = React.lazy(() =>
  import("./pages/events/scientificStudy/AdminScientificStudyEvent.js").then(
    (m) => ({ default: m.ScientificStudyCreate }),
  ),
);

const ScientificStudyEdit = React.lazy(() =>
  import("./pages/events/scientificStudy/AdminScientificStudyEvent.js").then(
    (m) => ({ default: m.ScientificStudyEdit }),
  ),
);

const TransactionCreate = React.lazy(() =>
  import("./pages/events/transaction/AdminTransactionEvent.js").then((m) => ({
    default: m.TransactionCreate,
  })),
);

const TransactionEdit = React.lazy(() =>
  import("./pages/events/transaction/AdminTransactionEvent.js").then((m) => ({
    default: m.TransactionEdit,
  })),
);

const TransactionList = React.lazy(() =>
  import("./pages/events/transaction/AdminTransactionEvent.js").then((m) => ({
    default: m.TransactionList,
  })),
);
const ActorList = React.lazy(() => import("./pages/actors/ActorList.js"));
const ActorCreate = React.lazy(() => import("./pages/actors/ActorCreate.js"));
const ActorEdit = React.lazy(() => import("./pages/actors/ActorEdit.js"));

const BookCreate = React.lazy(
  () => import("./pages/events/book/BookCreate.js"),
);
const BookEdit = React.lazy(() => import("./pages/events/book/BookEdit.js"));
const BookList = React.lazy(() => import("./pages/events/book/BookList.js"));

const DeathCreate = React.lazy(
  () => import("./pages/events/death/DeathCreate.js"),
);
const DeathEdit = React.lazy(() => import("./pages/events/death/DeathEdit.js"));
const DeathList = React.lazy(() => import("./pages/events/death/DeathList.js"));

const PatentList = React.lazy(
  () => import("./pages/events/patent/PatentList.js"),
);
const PatentCreate = React.lazy(
  () => import("./pages/events/patent/PatentCreate.js"),
);
const PatentEdit = React.lazy(
  () => import("./pages/events/patent/PatentEdit.js"),
);

const NationList = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/nations/AdminNations.js").then(
    (m) => ({ default: m.NationList }),
  ),
);

const NationEdit = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/nations/AdminNations.js").then(
    (m) => ({ default: m.NationEdit }),
  ),
);

const NationCreate = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/nations/AdminNations.js").then(
    (m) => ({ default: m.NationCreate }),
  ),
);

const ScientificStudiesList = React.lazy(() =>
  import("./pages/events/scientificStudy/AdminScientificStudyEvent.js").then(
    (m) => ({ default: m.ScientificStudiesList }),
  ),
);

const UncategorizedEventCreate = React.lazy(
  () => import("./pages/events/AdminUncategorizedEvent.js"),
);

const MyMenu: React.FC<MenuProps> = () => (
  <Menu>
    <Menu.DashboardItem />
    <Menu.ResourceItems />
  </Menu>
);
const MyLayout: React.FC<LayoutProps> = ({ children, ...props }) => (
  <Layout {...props} menu={MyMenu}>
    {children}
    <CheckForApplicationUpdate />
  </Layout>
);

const AdminPage: React.FC = () => {
  const apiProvider = useDataProvider();
  const authProvider = GetAuthProvider(apiProvider);
  return (
    <Admin
      dataProvider={apiProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      loginPage={Login}
      theme={adminThemeOptions}
      layout={MyLayout}
    >
      <Resource
        name="pages"
        edit={PageEdit}
        list={PageList}
        create={PageCreate}
        icon={PostAddIcon}
      />

      <Resource
        name="stories"
        list={StoryList}
        edit={StoryEdit}
        create={StoryCreate}
        icon={AssignmentIcon}
      />

      <Resource
        name="media"
        list={MediaList}
        edit={MediaEdit}
        create={MediaCreate}
        icon={PermMediaIcon}
      >
        <Route path="multiple" element={<MediaCreateMany />} />
      </Resource>

      <Resource
        name="links"
        list={LinkList}
        edit={LinkEdit}
        create={LinkCreate}
        icon={LinkIcon}
      />

      <Resource
        name="actors"
        list={ActorList}
        edit={ActorEdit}
        create={ActorCreate}
        icon={ActorIcon}
      />
      <Resource
        name="groups"
        list={GroupList}
        edit={GroupEdit}
        create={GroupCreate}
        icon={GroupIcon}
      />
      <Resource
        name="groups-members"
        list={GroupMemberList}
        create={GroupMemberCreate}
        edit={GroupMemberEdit}
      />
      <Resource
        name="areas"
        list={AreaList}
        create={AreaCreate}
        edit={AreaEdit}
        icon={AreaIcon}
      />
      <Resource
        name="graphs"
        list={GraphList}
        edit={GraphEdit}
        create={GraphCreate}
        icon={GraphIcon}
      />

      <Resource
        name="events/suggestions"
        list={EventSuggestionList}
        edit={EventSuggestionEdit}
      />

      <Resource
        name="events"
        list={EventList}
        edit={EventEdit}
        create={UncategorizedEventCreate}
        icon={UncategorizedEventIcon}
      />

      <Resource
        name="books"
        list={BookList}
        edit={BookEdit}
        create={BookCreate}
        icon={BookEventIcon}
      />

      <Resource
        name="deaths"
        list={DeathList}
        edit={DeathEdit}
        create={DeathCreate}
        icon={DeathEventIcon}
      />

      <Resource
        name="scientific-studies"
        list={ScientificStudiesList}
        edit={ScientificStudyEdit}
        create={ScientificStudyCreate}
        icon={ScientificStudyEventIcon}
      />
      <Resource
        name="patents"
        list={PatentList}
        edit={PatentEdit}
        create={PatentCreate}
        icon={PatentEventIcon}
      />
      <Resource
        name="documentaries"
        list={DocumentaryList}
        edit={DocumentaryEdit}
        create={DocumentaryCreate}
        icon={DocumentaryEventIcon}
      />

      <Resource
        name="quotes"
        list={QuoteList}
        edit={QuoteEdit}
        create={QuoteCreate}
        icon={QuoteEventIcon}
      />
      <Resource
        name="transactions"
        list={TransactionList}
        edit={TransactionEdit}
        create={TransactionCreate}
        icon={TransactionEventIcon}
      />
      <Resource
        name="links"
        list={LinkList}
        edit={LinkEdit}
        create={LinkCreate}
      />
      <Resource
        name="keywords"
        list={KeywordList}
        edit={KeywordEdit}
        create={KeywordCreate}
        icon={HashtagIcon}
      />

      <Resource
        name={"social-posts"}
        list={SocialPostList}
        edit={SocialPostEdit}
        create={SocialPostCreate}
        icon={SocialPostIcon}
      />
      <Resource
        name="users"
        list={UserList}
        edit={UserEdit}
        create={UserCreate}
        icon={UserIcon}
      />
      <Resource
        name="settings"
        list={SettingList}
        edit={SettingEdit}
        create={SettingCreate}
      />

      <Resource
        name="nations"
        list={NationList}
        edit={NationEdit}
        create={NationCreate}
        icon={NationIcon}
      />

      <Resource name="queues" list={QueueList} create={QueueCreate} />
      <CustomRoutes>
        <Route path="/" element={<AdminStats />} />
        <Route path="/queues/:type/:resource/:id" element={<QueueEdit />} />
      </CustomRoutes>
    </Admin>
  );
};

export default AdminPage;
