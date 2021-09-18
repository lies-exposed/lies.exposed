import { theme } from "@econnessione/ui/theme";
import AssignmentIcon from "@material-ui/icons/Assignment";
import BusinessIcon from "@material-ui/icons/Business";
import EventIcon from "@material-ui/icons/Event";
import GroupIcon from "@material-ui/icons/Group";
import MapIcon from "@material-ui/icons/Map";
import PostAddIcon from "@material-ui/icons/PostAdd";
import RecentActorsIcon from "@material-ui/icons/RecentActors";
import { AdminDeathEventsResource } from "components/AdminDeathEvents";
import { AdminLinksResource } from "components/AdminLinks";
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
import { EventCreate, EventEdit, EventList } from "./components/AdminEvents";
import {
  GroupMemberCreate,
  GroupMemberEdit,
  GroupMemberList,
} from "./components/AdminGroupMember";
import { GroupCreate, GroupEdit, GroupList } from "./components/AdminGroups";
import {
  ProjectCreate,
  ProjectEdit,
  ProjectList,
} from "./components/AdminProjects";
import { UserCreate, UserEdit, UserList } from "./components/AdminUsers";
import { PageCreate, PageEdit, PageList } from "./components/Pages";

const AdminPage: React.FC = () => {
  // eslint-disable-next-line no-console
  return (
    <Admin
      dataProvider={apiProvider}
      authProvider={authProvider}
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
        name="projects"
        list={ProjectList}
        edit={ProjectEdit}
        create={ProjectCreate}
        icon={BusinessIcon}
      />
      <Resource
        name="events"
        list={EventList}
        edit={EventEdit}
        create={EventCreate}
        icon={EventIcon}
      />

      <AdminDeathEventsResource name="deaths" />

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
