import AreasMap from "@components/AreasMap"
import { ErrorBox } from "@components/Common/ErrorBox"
import { Loader } from "@components/Common/Loader"
import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import { areasList, pageContent } from "@providers/DataProvider"
import { RouteComponentProps } from "@reach/router"
import * as QR from "avenger/lib/QueryResult"
import { WithQueries } from "avenger/lib/react"
import React from "react"

export default class AreasPage extends React.PureComponent<
  RouteComponentProps
> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{ pageContent, areas: areasList }}
        params={{
          pageContent: { id: "areas" },
          areas: {
            pagination: { perPage: 20, page: 1 },
            sort: { field: "id", order: "DESC" },
            filter: {},
          },
        }}
        render={QR.fold(
          Loader,
          ErrorBox,
          ({ pageContent, areas }) => (
            <MainContent>
              <PageContent {...pageContent} />
              <AreasMap areas={areas.map(a => a.frontmatter)} width={800} height={400} />
            </MainContent>
          )
        )}
      />
    )
  }
}
