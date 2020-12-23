// in app.js
import { ActorEdit, ActorList } from "@components/Admin/actors"
import { ArticleCreate, ArticleEdit, ArticleList } from "@components/Admin/articles"
import { GroupCreate, GroupEdit, GroupList } from "@components/Admin/groups"
import { Layout } from "@components/Layout"
import jsonServerProvider from "ra-data-json-server"
import * as React from "react"
import {
  Admin,
  EditGuesser,
  fetchUtils,
  ListGuesser,
  Resource
} from "react-admin"

const httpClient = (
  url: string,
  options: fetchUtils.Options = {}
): Promise<any> => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" })
  }
  // add your own headers here
  // options.headers.set('X-Custom-Header', 'foobar');
  console.log(url)
  return fetchUtils.fetchJson(url, options)
}
const dataProvider = jsonServerProvider("http://localhost:4010", httpClient)

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
