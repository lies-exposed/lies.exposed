import * as React from "react";

interface FlagIconProps {
  isoCode: string;
  width?: number;
}
export const FlagIcon: React.FC<FlagIconProps> = ({ isoCode, width = 26 }) => {
  const LazyIcon = React.useMemo(
    () =>
      React.lazy(
        () =>
          import(
            `../../../../assets/flags/svg/${isoCode.toLowerCase()}.svg?react`
          ),
      ),
    [isoCode],
  );

  return (
    <React.Suspense>
      <LazyIcon width={width} />
    </React.Suspense>
  );
};
