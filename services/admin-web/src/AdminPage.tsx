import {
  ProjectCreate,
  ProjectEdit,
  ProjectList,
} from "@components/AdminProjects";
import { UserCreate, UserEdit, UserList } from "@components/AdminUsers";
import PageIcon from "@material-ui/icons/Archive";
import ProjectIcon from "@material-ui/icons/Build";
import EventIcon from "@material-ui/icons/Event";
import GroupIcon from "@material-ui/icons/Group";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import * as React from "react";
import { Admin, defaultTheme, Login, Resource } from "react-admin";
import { apiProvider, authProvider } from "./client/HTTPAPI";
import { ActorCreate, ActorEdit, ActorList } from "./components/AdminActors";
import { AreaList, AreaCreate, AreaEdit } from "./components/AdminAreas";
import { EventCreate, EventEdit, EventList } from "./components/AdminEvents";
import {
  GroupMemberCreate,
  GroupMemberEdit,
  GroupMemberList,
} from "./components/AdminGroupMember";
import { GroupCreate, GroupEdit, GroupList } from "./components/AdminGroups";
import { PageCreate, PageEdit, PageList } from "./components/Pages";
import { ArticleCreate, ArticleEdit, ArticleList } from "./components/articles";

const AdminPage: React.FC = () => {
  // eslint-disable-next-line no-console
  return (
    <Admin
      dataProvider={apiProvider}
      authProvider={authProvider}
      loginPage={Login}
      theme={defaultTheme}
    >
      <Resource
        name="pages"
        edit={PageEdit}
        list={PageList}
        create={PageCreate}
        icon={PageIcon}
      />

      <Resource
        name="articles"
        list={ArticleList}
        edit={ArticleEdit}
        create={ArticleCreate}
      />

      <Resource
        name="actors"
        list={ActorList}
        edit={ActorEdit}
        create={ActorCreate}
        icon={VerifiedUserIcon}
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
      />

      <Resource
        name="projects"
        list={ProjectList}
        edit={ProjectEdit}
        create={ProjectCreate}
        icon={ProjectIcon}
      />
      <Resource
        name="events"
        list={EventList}
        edit={EventEdit}
        create={EventCreate}
        icon={EventIcon}
      />

      <Resource
        name="users"
        list={UserList}
        edit={UserEdit}
        create={UserCreate}
        icon={VerifiedUserIcon}
      />
    </Admin>
  );
};

export default AdminPage;
