import { Layout } from "@liexp/ui/components/Layout";
import SEO from "@liexp/ui/components/SEO";
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
