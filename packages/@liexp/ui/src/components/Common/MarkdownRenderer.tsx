/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react";
import { editor } from "./Editor/index.js";

// export const components: MDXProviderComponentsProp = {
//   // layout
//   MainContent,
//   // counters
//   CO2LeftBudgetCounter,
//   WorldPopulationCounter,
//   // graphs
//   CO2LevelsGraph,
//   HumanPopulationGrowthGraph,
//   SocietyCollapseForecastGraph: SocietyCollapseForecastGraphContainer,
//   // graph examples
//   NetworkExample,
//   BubbleGraphExample,
//   // maps
//   AreasMap,
//   // page content examples
//   ActorPageContentExample,
//   GroupPageContentExample,
//   ProjectPageContentExample,
//   KeywordPageContentExample,
//   EventPageContentExample,
//   EventSliderExample,
//   // lists
//   ProjectImageList,
//   // components
//   // DisplayXSmall,
//   // DisplaySmall,
//   // DisplayMedium,
//   // DisplayLarge,
//   FullSizeSection,
//   Video,
//   // GQLVoyager,
//   // common tags
//   // p: ParagraphMedium,
//   li: ListItem,
//   blockquote: BlockQuote,
//   h1: ({ children }) => <Typography variant="h1">{children}</Typography>,
//   h2: ({ children }) => <Typography variant="h2">{children}</Typography>,
//   h3: ({ children }) => <Typography variant="h3">{children}</Typography>,
//   h4: ({ children }) => <Typography variant="h4">{children}</Typography>,
//   h5: ({ children }) => <Typography variant="h5">{children}</Typography>,
//   h6: ({ children }) => <Typography variant="h6">{children}</Typography>,
//   p: ({ children }) => (
//     <Typography className="body" style={{ marginBottom: 20 }}>
//       {children}
//     </Typography>
//   ),
// };

// export const MarkdownRenderer: React.FC = ({ children }): JSX.Element => {
//   // eslint-disable-next-line react/no-children-prop
//   return <MDX components={components}>{children}</MDX>;
// };

export const MarkdownRenderer: React.FC<{ children: any }> = ({ children }) => {
  return <editor.LazyEditor value={children} readOnly />;
};
