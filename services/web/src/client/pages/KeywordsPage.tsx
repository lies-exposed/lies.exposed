import KeywordsDistributionGraph from "@liexp/ui/lib/components/Graph/KeywordDistributionGraph.js";
import { AutocompleteKeywordInput } from "@liexp/ui/lib/components/Input/AutocompleteKeywordInput.js";
import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils.js";

const KeywordsPage: React.FC = () => {
  const navigateTo = useNavigateToResource();
  return (
    <MainContent>
      {/* <PageContent path="keywords" /> */}

      <Box margin={10}>
        <AutocompleteKeywordInput
          selectedItems={[]}
          onChange={(k) => {
            navigateTo.keywords({ id: k[0].id });
          }}
        />
      </Box>

      <KeywordsDistributionGraph
        onClick={(k) => {
          navigateTo.keywords({ id: k.id });
        }}
      />
    </MainContent>
  );
};

export default KeywordsPage;
