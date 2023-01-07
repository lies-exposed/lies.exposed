import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ResourcesNames } from "@liexp/shared/io/http";
import * as React from "react";
import { getAdminLink, getProfileLink } from "../../../utils/links.utils";
import { Link } from "../../mui";

interface EditButtonProps {
  admin: boolean;
  resourceName: ResourcesNames;
  resource: { id: string };
}

const EditButton: React.FC<EditButtonProps> = ({
  admin,
  resourceName,
  resource,
}) => {
  const href = admin
    ? getAdminLink(resourceName, resource)
    : getProfileLink(resourceName, resource);


  return (
    <Link href={href} target="_blank" rel="noreferrer">
      <FontAwesomeIcon icon="edit" />
    </Link>
  );
};

export default EditButton;
