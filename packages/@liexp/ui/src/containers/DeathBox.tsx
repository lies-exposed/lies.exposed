import { formatDate } from "@liexp/shared/utils/date";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { ErrorBox } from "../components/Common/ErrorBox";
import { LazyFullSizeLoader } from "../components/Common/FullSizeLoader";
import { Queries } from "../providers/DataProvider";

export class DeathBox extends React.PureComponent<{
  id: string;
}> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.id),
      O.fold(
        () => <div>Missing death id</div>,
        (deathId) => (
          <WithQueries
            queries={{ death: Queries.DeathEvent.get }}
            params={{
              death: { id: deathId },
            }}
            render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ death }) => {
              return <div>Died on {formatDate(death.date)}</div>;
            })}
          />
        )
      )
    );
  }
}
