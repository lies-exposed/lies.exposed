import { PageContent } from "@econnessione/ui/components/PageContent";
import { Grid } from "@material-ui/core";
import * as React from "react";
import * as Helmet from "react-helmet";

export default class IndexPage extends React.PureComponent<any> {
  render(): JSX.Element {
    return (
      <Grid container style={{ width: "100%" }}>
        <Grid item lg={1} />
        <Grid item lg={10} md={12} xs={12}>
          <Helmet.Helmet>
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
          </Helmet.Helmet>
          <PageContent queries={{ pageContent: { path: "index" } }} />
        </Grid>
      </Grid>
    );
  }
}
