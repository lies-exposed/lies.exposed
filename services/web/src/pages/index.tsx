import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { pageContent } from "@providers/DataProvider"
import * as QR from "avenger/lib/QueryResult"
import { WithQueries } from "avenger/lib/react"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { Spinner } from "baseui/icon"
import React from "react"
import Helmet from "react-helmet"

export default class IndexPage extends React.PureComponent<any> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{ pageContent }}
        params={{ pageContent: { id: "index" } }}
        render={QR.fold(
          () => (
            <Spinner />
          ),
          (e) => (
            <p>{JSON.stringify(e, null, 4)}</p>
          ),
          ({ pageContent }) => {
            return (
              <FlexGrid height="100%">
                <FlexGridItem height="100%" width="100%">
                  <Helmet>
                    <link
                      rel="stylesheet"
                      type="text/css"
                      href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
                    />
                    <link
                      rel="stylesheet"
                      type="text/css"
                      href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
                    />
                  </Helmet>
                  <SEO title="Home" />
                  <PageContent {...pageContent} />
                </FlexGridItem>
              </FlexGrid>
            )
          }
        )}
      />
    )
  }
}
