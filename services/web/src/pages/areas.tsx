import AreasMap from "@econnessione/ui/components/AreasMap";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import { pageContentByPath } from "@econnessione/ui/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";

export default class AreasPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{ pageContent: pageContentByPath }}
        params={{
          pageContent: { path: "areas" },
        }}
        render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ pageContent }) => (
          <MainContent>
            <PageContent {...pageContent} />
            <AreasMap center={[9.18951, 45.46427]} zoom={11} />
          </MainContent>
        ))}
      />
    );
  }
}
