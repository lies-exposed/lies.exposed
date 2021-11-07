import AreasMap from "@econnessione/ui/components/AreasMap";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import { RouteComponentProps } from "@reach/router";
import * as React from "react";

export default class AreasPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <MainContent>
        <PageContent queries={{ pageContent: { path: "areas" } }} />
        <AreasMap
          center={[9.18951, 45.46427]}
          zoom={11}
          onMapClick={() => undefined}
        />
      </MainContent>
    );
  }
}
