// in app.js
import { ActorEdit, ActorList } from "@components/Admin/actors"
import { ArticleCreate, ArticleEdit, ArticleList } from "@components/Admin/articles"
import { GroupCreate, GroupEdit, GroupList } from "@components/Admin/groups"
import { Layout } from "@components/Layout"
import * as React from "react"
import {
  Admin,
  EditGuesser,
  Resource
} from "react-admin"
import { dataProvider } from "../providers/DataProvider"


const AdminPage: React.FC = () => {
  return (
    <Layout>
      <Admin dataProvider={dataProvider}>
        <Resource
          name="actors"
          list={ActorList}
          edit={ActorEdit}
          create={EditGuesser}
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
    </Layout>
  )
}

export default AdminPage
