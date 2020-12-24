import { FullSizeViewport } from "@components/FullSizeSection/FullSizeSection"
import { CO2LevelsGraph } from "@components/Graph/CO2LevelsGraph"
import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import * as QR from "avenger/lib/QueryResult"
import { useQuery } from "avenger/lib/react"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { Spinner } from "baseui/icon"
import { pipe } from "fp-ts/lib/pipeable"
import { PageProps } from "gatsby"
import React from "react"
import Helmet from "react-helmet"
import { onePage } from "../providers/DataProvider"

const IndexPage: React.FC = () => {
  return pipe(
    useQuery(onePage, {
      id: "index",
    }),
    QR.fold(
      () => <Spinner />,
      () => <p>there was a problem when fetching preferences</p>,
      (page) => (
        <>
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
                <PageContent {...page} />
              </MainContent>
            </FlexGridItem>
          </FlexGrid>
        </>
      )
    )
  )
}

const IndexPageContainer: React.FC<PageProps> = (props) => {
  console.log(props)

  const [Component, setComponent] = React.useState<React.FC | null>(null)

  React.useEffect(() => {
    setComponent(IndexPage)
  }, [props.data])

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
      {Component ? <Component /> : null}
    </Layout>
  )
}

export default IndexPageContainer
