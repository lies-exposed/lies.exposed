import { apiProvider, authProvider } from "@liexp/ui/lib/client/api";
import { Admin, Login, Resource } from "@liexp/ui/lib/components/admin";
import {
  EventSuggestionEdit,
  EventSuggestionList,
} from "@liexp/ui/lib/components/admin/events/suggestions/AdminEventSuggestion";
import {
  LinkCreate,
  LinkEdit,
  LinkList,
} from "@liexp/ui/lib/components/admin/links/AdminLinks";
import {
  MediaCreate,
  MediaCreateMany,
  MediaEdit,
  MediaList,
} from "@liexp/ui/lib/components/admin/media";
import {
  StoryCreate,
  StoryEdit,
  StoryList,
} from "@liexp/ui/lib/components/admin/stories/AdminStories";
import { i18nProvider } from "@liexp/ui/lib/i18n/i18n.provider";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import LinkIcon from "@mui/icons-material/Link";
import MapIcon from "@mui/icons-material/Map";
import PermMediaIcon from "@mui/icons-material/PermMedia";
import PostAddIcon from "@mui/icons-material/PostAdd";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import * as React from "react";
import { Route } from "react-router-dom";
import "./index.css";
import { ActorCreate, ActorEdit, ActorList } from "./pages/AdminActors";
import { AreaCreate, AreaEdit, AreaList } from "./pages/AdminAreas";
import { EventEdit, EventList } from "./pages/AdminEvents";
import {
  GroupMemberCreate,
  GroupMemberEdit,
  GroupMemberList,
} from "./pages/AdminGroupMember";
import { GroupCreate, GroupEdit, GroupList } from "./pages/AdminGroups";
import { KeywordCreate, KeywordEdit, KeywordList } from "./pages/AdminKeyword";
import { SocialPostEdit, SocialPostList } from "./pages/AdminSocialPost";
import { UserCreate, UserEdit, UserList } from "./pages/AdminUsers";
import { PageCreate, PageEdit, PageList } from "./pages/Pages";
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

const AdminPage: React.FC = () => {
  // eslint-disable-next-line no-console
  return (
    <Admin
      dataProvider={apiProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      loginPage={Login}
      theme={adminThemeOptions as any}
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
        icon={RecentActorsIcon}
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
        icon={MapIcon}
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
        icon={EventIcon}
      />

      <Resource
        name="deaths"
        list={DeathList}
        edit={DeathEdit}
        create={DeathCreate}
      />

      <Resource
        name="scientific-studies"
        list={ScientificStudiesList}
        edit={ScientificStudyEdit}
        create={ScientificStudyCreate}
      />
      <Resource
        name="patents"
        list={PatentList}
        edit={PatentEdit}
        create={PatentCreate}
      />
      <Resource
        name="documentaries"
        list={DocumentaryList}
        edit={DocumentaryEdit}
        create={DocumentaryCreate}
      />
      <Resource
        name="transactions"
        list={TransactionList}
        edit={TransactionEdit}
        create={TransactionCreate}
      />

      <Resource
        name="quotes"
        list={QuoteList}
        edit={QuoteEdit}
        create={QuoteCreate}
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
      />

      <Resource name={"social-posts"} list={SocialPostList} edit={SocialPostEdit} />
      <Resource
        name="users"
        list={UserList}
        edit={UserEdit}
        create={UserCreate}
        icon={RecentActorsIcon}
      />
    </Admin>
  );
};

export default AdminPage;
