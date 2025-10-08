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
import { SocialPostEdit } from "@liexp/ui/lib/components/admin/SocialPost/SocialPostEdit.js";
import {
  EventSuggestionEdit,
  EventSuggestionList,
} from "@liexp/ui/lib/components/admin/events/suggestions/AdminEventSuggestion.js";
import {
  LinkCreate,
  LinkList,
} from "@liexp/ui/lib/components/admin/links/AdminLinks.js";
import { LinkEdit } from "@liexp/ui/lib/components/admin/links/LinkEdit.js";
import {
  MediaCreate,
  MediaCreateMany,
  MediaEdit,
  MediaList,
} from "@liexp/ui/lib/components/admin/media/index.js";
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
  StoryCreate,
  StoryEdit,
  StoryList,
} from "@liexp/ui/lib/components/admin/stories/AdminStories.js";
import { UserEdit } from "@liexp/ui/lib/components/admin/user/UserEdit.js";
import {
  Assignment as AssignmentIcon,
  PermMedia as PermMediaIcon,
  PostAdd as PostAddIcon,
} from "@liexp/ui/lib/components/mui/icons.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import { i18nProvider } from "@liexp/ui/lib/i18n/i18n.provider.js";
import * as React from "react";
import { Route } from "react-router";
import { AreaCreate, AreaEdit, AreaList } from "./pages/AdminAreas.js";
import { EventEdit, EventList } from "./pages/AdminEvents.js";
import { GraphCreate, GraphEdit, GraphList } from "./pages/AdminGraph.js";
import {
  GroupMemberCreate,
  GroupMemberEdit,
  GroupMemberList,
} from "./pages/AdminGroupMember.js";
import { GroupCreate, GroupEdit, GroupList } from "./pages/AdminGroups.js";
import {
  KeywordCreate,
  KeywordEdit,
  KeywordList,
} from "./pages/AdminKeyword.js";
import { QueueCreate, QueueEdit, QueueList } from "./pages/AdminQueue.js";
import {
  SettingCreate,
  SettingEdit,
  SettingList,
} from "./pages/AdminSetting.js";
import { SocialPostCreate, SocialPostList } from "./pages/AdminSocialPost.js";
import { UserCreate, UserList } from "./pages/AdminUsers.js";
import { PageCreate, PageEdit, PageList } from "./pages/Pages.js";
import { AdminStats } from "./pages/dashboard/AdminStats.js";
import {
  DocumentaryCreate,
  DocumentaryEdit,
  DocumentaryList,
} from "./pages/events/documentary/AdminDocumentaryEvent.js";
import {
  QuoteCreate,
  QuoteEdit,
  QuoteList,
} from "./pages/events/quote/AdminQuoteEvent.js";
import {
  ScientificStudyCreate,
  ScientificStudyEdit,
} from "./pages/events/scientificStudy/AdminScientificStudyEvent.js";
import {
  TransactionCreate,
  TransactionEdit,
  TransactionList,
} from "./pages/events/transaction/AdminTransactionEvent.js";
import { adminThemeOptions } from "./theme.js";

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
    ({ NationList }) => ({ default: NationList }),
  ),
);

const NationEdit = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/nations/AdminNations.js").then(
    ({ NationEdit }) => ({ default: NationEdit }),
  ),
);

const NationCreate = React.lazy(() =>
  import("@liexp/ui/lib/components/admin/nations/AdminNations.js").then(
    ({ NationCreate }) => ({ default: NationCreate }),
  ),
);

const ScientificStudiesList = React.lazy(() =>
  import("./pages/events/scientificStudy/AdminScientificStudyEvent.js").then(
    ({ ScientificStudiesList }) => ({ default: ScientificStudiesList }),
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
