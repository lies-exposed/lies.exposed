import { formatDate } from "@econnessione/shared/utils/date";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

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
