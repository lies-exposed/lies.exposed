import {
  ProjectCreate,
  ProjectEdit,
  ProjectList,
} from "@components/AdminProjects";
import PageIcon from "@material-ui/icons/Archive";
import ProjectIcon from "@material-ui/icons/Build";
import EventIcon from "@material-ui/icons/Event";
import GroupIcon from "@material-ui/icons/Group";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import * as React from "react";
import { Admin, AuthProvider, Login, Resource } from "react-admin";
import { apiProvider } from "./client/HTTPAPI";
import { ActorCreate, ActorEdit, ActorList } from "./components/AdminActors";
import { EventCreate, EventEdit, EventList } from "./components/AdminEvents";
import {
  GroupMemberCreate,
  GroupMemberEdit,
  GroupMemberList,
} from "./components/AdminGroupMember";
import { GroupCreate, GroupEdit, GroupList } from "./components/AdminGroups";
import { PageCreate, PageEdit, PageList } from "./components/Pages";
import { ArticleCreate, ArticleEdit, ArticleList } from "./components/articles";

const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const authToken = await Promise.resolve(`${username}-${password}`);
    localStorage.setItem("auth", authToken);
    return authToken;
  },
  logout: () => Promise.resolve(),
  checkAuth: async () =>
    localStorage.getItem("auth")
      ? await Promise.resolve()
      : await Promise.reject(new Error("Missing auth")),
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
};

const AdminPage: React.FC = () => {
  // eslint-disable-next-line no-console
  return (
    <Admin
      dataProvider={apiProvider}
      authProvider={authProvider}
      loginPage={Login}
    >
      <Resource
        name="pages"
        list={PageList}
        edit={PageEdit}
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
    </Admin>
  );
};

export default AdminPage;
