import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { PageContent } from "@econnessione/shared/components/PageContent";
import SEO from "@econnessione/shared/components/SEO";
import { pageContentByPath } from "@econnessione/shared/providers/DataProvider";
import { Grid } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import React from "react";
import Helmet from "react-helmet";

export default class IndexPage extends React.PureComponent<any> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{ pageContentByPath }}
        params={{ pageContentByPath: { path: "index" } }}
        render={QR.fold(
          LazyFullSizeLoader,
          ErrorBox,
          ({ pageContentByPath: pageContent }) => {
            return (
              <Grid>
                <Grid item>
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
                </Grid>
              </Grid>
            );
          }
        )}
      />
    );
  }
}
