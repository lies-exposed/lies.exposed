import React from "react"
import Layout from "../components/Layout"
import SEO from "../components/SEO"
import Columns from "react-bulma-components/lib/components/columns"

const SupportPage = () => (
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
