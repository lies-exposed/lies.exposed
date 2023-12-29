import { type Area } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { AutocompleteAreaInput } from "../components/Input/AutocompleteAreaInput";
import { Container } from "../components/mui";
import { PageContentBox } from "../containers/PageContentBox";

export interface SearchAreaTemplateProps {
  onAreaClick: (a: Area.Area) => void;
}

const SearchAreaTemplate: React.FC<SearchAreaTemplateProps> = ({
  onAreaClick,
}) => {
  return (
    <Container style={{ height: innerHeight, width: "100%" }}>
      <PageContentBox path="areas" />
      <AutocompleteAreaInput
        selectedItems={[]}
        onChange={(a) => {
          if (Array.isArray(a) && a[0]) {
            onAreaClick(a[0]);
          }
        }}
        discrete={true}
      />
    </Container>
  );
};
export default SearchAreaTemplate;
