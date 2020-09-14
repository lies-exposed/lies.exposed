import { faEdit } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Frontmatter } from "@models/Frontmatter"
import { ResourcesKeys } from "@models/index"
import { getAdminLink } from "@utils/links"
import { StyledLink } from "baseui/link"
import * as React from 'react'

interface EditButtonProps {
  resourceName: ResourcesKeys
  resource: Frontmatter
}

const EditButton: React.FC<EditButtonProps> = (props) => {
  return (
    <StyledLink href={getAdminLink(props.resourceName, props.resource)} target="_blank">
      <FontAwesomeIcon icon={faEdit} />
    </StyledLink>
  )
}

export default EditButton