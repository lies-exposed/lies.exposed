import { Layout } from "@econnessione/ui/components/Layout";
import SEO from "@econnessione/ui/components/SEO";
import * as React from "react";

const SupportPage: React.FunctionComponent = () => (
  <Layout
    header={{
      menu: [],
      onTitleClick: () => undefined,
      onMenuItemClick: () => undefined,
    }}
  >
    <SEO title="Home" />
    <div>
      <div>
        <p>In sviluppo</p>
      </div>
    </div>
  </Layout>
);

export default SupportPage;
