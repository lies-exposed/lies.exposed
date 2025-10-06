import { type ResourcesNames } from "@liexp/shared/lib/io/http/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import { useAuthProvider } from "ra-core";
import * as React from "react";
import { useConfiguration } from "../../../context/ConfigurationContext.js";
import { getAdminLink, getProfileLink } from "../../../utils/links.utils.js";
import { Link } from "../../mui/index.js";
import { FAIcon } from "../Icons/FAIcon.js";

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
  const conf = useConfiguration();
  const authProvider = useAuthProvider();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(admin ?? null);

  React.useEffect(() => {
    if (admin === undefined) {
      void authProvider?.checkAuth({}).then(
        async () => {
          const permissions = await authProvider.getPermissions?.({});
          setIsAdmin(checkIsAdmin(permissions));
        },
        () => {
          setIsAdmin(null);
        },
      );
    }
  }, [authProvider]);

  if (isAdmin === null) {
    return null;
  }

  const href = isAdmin
    ? getAdminLink(conf)(resourceName, resource)
    : getProfileLink(userResourceName, resource);

  return (
    <Link href={href} target="_blank" rel="noreferrer">
      <FAIcon icon="edit" />
    </Link>
  );
};

export default EditButton;
