import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import { Loader } from "@liexp/ui/components/Common/Loader";
import { ContentWithSidebar } from "@liexp/ui/components/ContentWithSidebar";
import { PageContent } from "@liexp/ui/components/PageContent";
import SEO from "@liexp/ui/components/SEO";
import { TableOfContents } from "@liexp/ui/components/TableOfContents";
import { pageContentByPath } from "@liexp/ui/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";

export default class TheCrisisPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <>
        <ContentWithSidebar
          sidebar={pipe(
            O.some({ items: [] }),
            O.chainNullableK((t) => t.items),
            O.fold(
              () => <div />,
              (items) => <TableOfContents items={items} />
            )
          )}
        >
          <PageContent queries={{ pageContent: { path: "the-crisis" } }} />
        </ContentWithSidebar>
      </>
    );
  }
}
