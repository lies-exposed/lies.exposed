import { GetAuthProvider } from "@liexp/ui/lib/client/api.js";
import {
  ActorIcon,
  AreaIcon,
  BookEventIcon,
  DeathEventIcon,
  DocumentaryEventIcon,
  GroupIcon,
  HashtagIcon,
  LinkIcon,
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
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import { i18nProvider } from "@liexp/ui/lib/i18n/i18n.provider.js";
import AssignmentIcon from "@mui/icons-material/Assignment.js";
import PermMediaIcon from "@mui/icons-material/PermMedia.js";
import PostAddIcon from "@mui/icons-material/PostAdd.js";
import * as React from "react";
import { Route } from "react-router-dom";
import { ActorCreate, ActorEdit, ActorList } from "./pages/AdminActors";
import { AreaCreate, AreaEdit, AreaList } from "./pages/AdminAreas";
import { EventEdit, EventList } from "./pages/AdminEvents";
import {
  GroupMemberCreate,
  GroupMemberEdit,
  GroupMemberList,
} from "./pages/AdminGroupMember";
import { GroupCreate, GroupEdit, GroupList } from "./pages/AdminGroups";
import {
  KeywordCreate,
  KeywordEdit,
  KeywordList,
} from "./pages/AdminKeyword";
import { SocialPostCreate, SocialPostList } from "./pages/AdminSocialPost";
import { UserCreate, UserList } from "./pages/AdminUsers";
import { PageCreate, PageEdit, PageList } from "./pages/Pages";
import { AdminStats } from "./pages/dashboard/AdminStats";
import {
  BookCreate,
  BookEdit,
  BookList,
} from "./pages/events/AdminBookEvent";
import {
  DeathCreate,
  DeathEdit,
  DeathList,
} from "./pages/events/AdminDeathEvent";
import {
  DocumentaryCreate,
  DocumentaryEdit,
  DocumentaryList,
} from "./pages/events/AdminDocumentaryEvent";
import {
  PatentCreate,
  PatentEdit,
  PatentList,
} from "./pages/events/AdminPatentEvent";
import {
  QuoteCreate,
  QuoteEdit,
  QuoteList,
} from "./pages/events/AdminQuoteEvent";
import {
  ScientificStudiesList,
  ScientificStudyCreate,
  ScientificStudyEdit,
} from "./pages/events/AdminScientificStudyEvent";
import {
  TransactionCreate,
  TransactionEdit,
  TransactionList,
} from "./pages/events/AdminTransactionEvent";
import { UncategorizedEventCreate } from "./pages/events/AdminUncategorizedEvent";
import { adminThemeOptions } from "./theme";

const MyMenu: React.FC<MenuProps> = (props) => (
  <Menu>
    <Menu.DashboardItem />
    <Menu.ResourceItems />
  </Menu>
);
const MyLayout: React.FC<LayoutProps> = (props) => (
  <Layout {...props} menu={MyMenu} />
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
      theme={adminThemeOptions as any}
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
        name="transactions"
        list={TransactionList}
        edit={TransactionEdit}
        create={TransactionCreate}
        icon={TransactionEventIcon}
      />

      <Resource
        name="quotes"
        list={QuoteList}
        edit={QuoteEdit}
        create={QuoteCreate}
        icon={QuoteEventIcon}
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
      <CustomRoutes>
        <Route path="/" element={<AdminStats />} />
      </CustomRoutes>
    </Admin>
  );
};

export default AdminPage;
