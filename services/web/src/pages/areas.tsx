import AreasMap from "@econnessione/shared/components/AreasMap";
import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { Loader } from "@econnessione/shared/components/Common/Loader";
import { MainContent } from "@econnessione/shared/components/MainContent";
import { PageContent } from "@econnessione/shared/components/PageContent";
import { pageContentByPath } from "@econnessione/shared/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import React from "react";

export default class AreasPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{ pageContent: pageContentByPath, }}
        params={{
          pageContent: { path: "areas" },
        }}
        render={QR.fold(
          Loader,
          ErrorBox,
          ({ pageContent }) => (
            <MainContent>
              <PageContent {...pageContent} />
              <AreasMap
                center={[9.18951, 45.46427]}
                zoom={11}
              />
            </MainContent>
          )
        )}
      />
    );
  }
}
