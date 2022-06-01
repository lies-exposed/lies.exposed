import { MainContent } from "@liexp/ui/components/MainContent";
import { PageContent } from "@liexp/ui/components/PageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { AreaList } from "@liexp/ui/components/lists/AreaList";
import { useAreasQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { Grid } from "@mui/material";
import { RouteComponentProps } from "@reach/router";
import * as React from "react";

const AreasPage: React.FC<RouteComponentProps> = ({ ...props }) => {
  return (
    <QueriesRenderer
      queries={{
        areas: useAreasQuery({
          filter: null,
          pagination: { perPage: 10, page: 1 },
          sort: { field: "createdAt", order: "DESC" },
        }),
      }}
      render={({ areas: { data: areas } }) => {
        return (
          <MainContent>
            <PageContent path="areas" />
            <Grid container>
              <Grid item md={3}>
                <AreaList
                  areas={areas.map((a) => ({ ...a, selected: false }))}
                  onItemClick={() => {}}
                />
              </Grid>
              <Grid item md={9}></Grid>
            </Grid>
          </MainContent>
        );
      }}
    />
  );
};
export default AreasPage;
