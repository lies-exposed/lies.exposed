import { theme } from "@econnessione/ui/theme";
import AssignmentIcon from "@material-ui/icons/Assignment";
import EventIcon from "@material-ui/icons/Event";
import GroupIcon from "@material-ui/icons/Group";
import MapIcon from "@material-ui/icons/Map";
import PostAddIcon from "@material-ui/icons/PostAdd";
import RecentActorsIcon from "@material-ui/icons/RecentActors";
import polyglotI18nProvider from "ra-i18n-polyglot";
import * as React from "react";
import { Admin, Login, Resource } from "react-admin";
import { apiProvider, authProvider } from "./client/HTTPAPI";
import { ActorCreate, ActorEdit, ActorList } from "./components/AdminActors";
import { AreaCreate, AreaEdit, AreaList } from "./components/AdminAreas";
import {
  ArticleCreate,
  ArticleEdit,
  ArticleList,
} from "./components/AdminArticles";
import { AdminDeathEventsResource } from "./components/AdminDeathEvents";
import { EventCreate, EventEdit, EventList } from "./components/AdminEvents";
import {
  GroupMemberCreate,
  GroupMemberEdit,
  GroupMemberList,
} from "./components/AdminGroupMember";
import { GroupCreate, GroupEdit, GroupList } from "./components/AdminGroups";
import { AdminLinksResource } from "./components/AdminLinks";
import { UserCreate, UserEdit, UserList } from "./components/AdminUsers";
import { PageCreate, PageEdit, PageList } from "./components/Pages";
import englishMessages from "./i18n/en-US";
import { AdminScientificStudiesResource } from "components/AdminScientificStudies";

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");

const AdminPage: React.FC = () => {
  // eslint-disable-next-line no-console
  return (
    <Admin
      dataProvider={apiProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      loginPage={Login}
      theme={theme}
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
        name="events"
        list={EventList}
        edit={EventEdit}
        create={EventCreate}
        icon={EventIcon}
      />

      <AdminDeathEventsResource name="deaths" />

      <AdminScientificStudiesResource name="scientific-studies" />

      <AdminLinksResource name="links" />
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
