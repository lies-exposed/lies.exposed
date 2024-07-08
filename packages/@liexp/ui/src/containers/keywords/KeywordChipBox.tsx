import { type UUID } from "io-ts-types/lib/UUID.js";
import * as React from "react";
import QueriesRenderer from "../../components/QueriesRenderer.js";
import {
  KeywordChip,
  type KeywordChipProps,
} from "../../components/keywords/KeywordChip.js";

type KeywordChipBoxProps = Omit<KeywordChipProps, "keyword"> & {
  id: UUID;
};

const KeywordChipBox = ({
  id,
  ...props
}: KeywordChipBoxProps): React.ReactNode | null => {
  return (
    <QueriesRenderer
      queries={(Q) => ({ keyword: Q.Keyword.get.useQuery({ id }) })}
      render={({ keyword }) => {
        return <KeywordChip {...props} keyword={keyword} />;
      }}
    />
  );
};

export default KeywordChipBox;
