import { FullSizeViewport } from "@components/FullSizeSection/FullSizeSection"
import { CO2LevelsGraph } from "@components/Graph/CO2LevelsGraph"
import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { PageContentFileNode } from "@models/page"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { graphql, useStaticQuery } from "gatsby"
import React from "react"
import Helmet from "react-helmet"

interface Results {
  pageContent: PageContentFileNode
}

const IndexPage: React.FC = () => {
  const { pageContent }: Results = useStaticQuery(graphql`
    query IndexPage {
      pageContent: file(
        sourceInstanceName: { eq: "pages" }
        name: { eq: "index" }
      ) {
        ...PageFileNode
      }
    }
  `)

  return (
    <Layout>
      <Helmet>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
        />
      </Helmet>
      <SEO title="Home" />

      <FullSizeViewport id="co2-graphs">
        {({ width, height }) => (
          <CO2LevelsGraph
            showPoints={false}
            showGrid={false}
            style={{ height, width }}
          />
        )}
      </FullSizeViewport>
      <FlexGrid width="100%" flexGridColumnCount={1}>
        {/* <FlexGridItem position="relative">
          <div>
            <Slider
              slides={slides}
              height={600}
              autoplay={true}
              autoplaySpeed={3000}
              arrows={false}
              infinite={true}
              size="cover"
            />
          </div>
        </FlexGridItem> */}

        <FlexGridItem paddingTop="70px">
          <MainContent>
            <PageContent {...pageContent.childMdx} />
          </MainContent>
        </FlexGridItem>
      </FlexGrid>
    </Layout>
  )
}

export default IndexPage
