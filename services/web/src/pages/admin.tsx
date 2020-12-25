// in app.js
import { ActorEdit, ActorList } from "@components/Admin/actors"
import {
  ArticleCreate,
  ArticleEdit,
  ArticleList,
} from "@components/Admin/articles"
import { GroupCreate, GroupEdit, GroupList } from "@components/Admin/groups"
import { dataProvider } from "@providers/DataProvider"
import { RouteComponentProps } from "@reach/router"
import * as React from "react"
import { Admin, EditGuesser, Resource } from "react-admin"

const AdminPage: React.FC<RouteComponentProps> = () => {
  // eslint-disable-next-line no-console
  return (
    <Admin dataProvider={dataProvider as any}>
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
  )
}

export default AdminPage
