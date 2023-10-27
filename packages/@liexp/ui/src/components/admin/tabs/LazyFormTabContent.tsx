import { fp, pipe } from "@liexp/core/lib/fp";
import { toError } from "fp-ts/Either";
import { NumberFromString } from "io-ts-types/lib/NumberFromString";
import * as React from "react";
import { useLocation } from "react-router";

export const LazyFormTabContent: React.FC<
  React.PropsWithChildren<{
    tab: number;
  }>
> = ({ tab, children }) => {
  const path = useLocation();

  const enabled = React.useMemo(() => {
    return pipe(
      path.pathname.split("/"),
      fp.A.last,
      fp.O.filter((n) => {
        return pipe(
          NumberFromString.decode(n),
          fp.E.mapLeft(toError),
          fp.E.filterOrElse((n) => n === tab, toError),
          fp.E.isRight,
        );
      }),
      fp.O.isSome,
    );
  }, [path.pathname]);

  if (!enabled) {
    return null;
  }

  return children;
};
