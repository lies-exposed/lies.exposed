import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ResourcesNames } from "@liexp/shared/io/http";
import { checkIsAdmin } from "@liexp/shared/utils/user.utils";
import * as React from "react";
import { authProvider } from "../../../client/api";
import { getAdminLink, getProfileLink } from "../../../utils/links.utils";
import { Link } from "../../mui";

interface EditButtonProps {
  admin?: boolean;
  resourceName: ResourcesNames;
  userResourceName?: ResourcesNames;
  resource: { id: string };
}

const EditButton: React.FC<EditButtonProps> = ({
  admin,
  resourceName,
  userResourceName = resourceName,
  resource,
}) => {
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(admin ?? null);

  React.useEffect(() => {
    if (admin === undefined) {
      void authProvider.checkAuth({}).then(
        async () => {
          const permissions = await authProvider.getPermissions({});
          setIsAdmin(checkIsAdmin(permissions));
        },
        (e) => {
          setIsAdmin(null);
        }
      );
    }
  }, []);

  if (isAdmin === null) {
    return null;
  }

  const href = isAdmin
    ? getAdminLink(resourceName, resource)
    : getProfileLink(userResourceName, resource);

  return (
    <Link href={href} target="_blank" rel="noreferrer">
      <FontAwesomeIcon icon="edit" />
    </Link>
  );
};

export default EditButton;
