import { brands } from "@fortawesome/fontawesome-svg-core/import.macro";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from "react";

export const GithubIcon: React.FC = () => (
  <FontAwesomeIcon icon={brands("github")} />
);
