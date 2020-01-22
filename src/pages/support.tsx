import React from "react"
import Columns from "react-bulma-components/lib/components/columns"
import Layout from "../components/Layout"
import SEO from "../components/SEO"

const SupportPage: React.FunctionComponent = () => (
  <Layout>
    <SEO title="Home" />
    <Columns>
      <Columns.Column size={12}>
        <p>In sviluppo</p>
      </Columns.Column>
    </Columns>
  </Layout>
)

export default SupportPage
