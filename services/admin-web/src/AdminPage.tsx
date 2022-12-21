import { apiProvider, authProvider } from "@liexp/ui/client/api";
import {
  ArticleCreate,
  ArticleEdit,
  ArticleList,
} from "@liexp/ui/components/admin/AdminArticles";
import {
  EventSuggestionEdit,
  EventSuggestionList,
} from "@liexp/ui/components/admin/events/suggestions/AdminEventSuggestion";
import englishMessages from "@liexp/ui/i18n/en-US";
import {
  LinkCreate,
  LinkEdit,
  LinkList,
} from "@liexp/ui/src/components/admin/AdminLinks";
import {
  MediaCreate,
  MediaEdit,
  MediaList,
} from "@liexp/ui/src/components/admin/AdminMedia";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import LinkIcon from "@mui/icons-material/Link";
import MapIcon from "@mui/icons-material/Map";
import PermMediaIcon from "@mui/icons-material/PermMedia";
import PostAddIcon from "@mui/icons-material/PostAdd";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import polyglotI18nProvider from "ra-i18n-polyglot";
import * as React from "react";
import { Admin, Login, Resource } from "react-admin";
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

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");

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
        name="articles"
        list={ArticleList}
        edit={ArticleEdit}
        create={ArticleCreate}
        icon={AssignmentIcon}
      />

      <Resource
        name="media"
        list={MediaList}
        edit={MediaEdit}
        create={MediaCreate}
        icon={PermMediaIcon}
      />

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
