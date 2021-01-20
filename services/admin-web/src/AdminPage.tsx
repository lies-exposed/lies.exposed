import * as React from "react";
import { Admin, AuthProvider, Login, Resource } from "react-admin";
import { apiProvider } from "./client/HTTPAPI";
import { ActorCreate, ActorEdit, ActorList } from "./components/AdminActors";
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
      />

      <Resource
        name="actors"
        list={ActorList}
        edit={ActorEdit}
        create={ActorCreate}
      />
      <Resource
        name="groups"
        list={GroupList}
        edit={GroupEdit}
        create={GroupCreate}
      />
      <Resource
        name="articles"
        list={ArticleList}
        edit={ArticleEdit}
        create={ArticleCreate}
      />
    </Admin>
  );
};

export default AdminPage;
