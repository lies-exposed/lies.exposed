import { PageContent } from "@liexp/ui/components/PageContent";
import SEO from "@liexp/ui/components/SEO";
import { Grid } from "@material-ui/core";
import * as React from "react";
import KeywordsDistributionGraph from "../components/KeywordDistributionGraph";
import EventsBox from "../components/events/EventsBox";

export default class IndexPage extends React.PureComponent<any> {
  render(): JSX.Element {
    return (
      <Grid container style={{ width: "100%" }}>
        <Grid item lg={1} />
        <Grid item lg={10} md={12} xs={12}>
          <SEO title="lies.exposed" />
          <PageContent queries={{ pageContent: { path: "index" } }} />
          <KeywordsDistributionGraph />
        </Grid>
      </Grid>
    );
  }
}
